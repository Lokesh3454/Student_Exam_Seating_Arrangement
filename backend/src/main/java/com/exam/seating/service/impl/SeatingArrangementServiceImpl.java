package com.exam.seating.service.impl;

import com.exam.seating.dto.request.GenerateSeatingRequestDto;
import com.exam.seating.dto.response.SeatingArrangementDetailDto;
import com.exam.seating.dto.response.SeatingGenerationResponseDto;
import com.exam.seating.dto.response.StudentSeatSearchResponseDto;
import com.exam.seating.entity.*;
import com.exam.seating.entity.enums.SeatStatus;
import com.exam.seating.entity.enums.SeatingStrategy;
import com.exam.seating.exception.BadRequestException;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.*;
import com.exam.seating.service.SeatingArrangementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SeatingArrangementServiceImpl implements SeatingArrangementService {

    private final ExamRepository examRepository;
    private final ExamStudentRepository examStudentRepository;
    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final SeatingArrangementRepository seatingArrangementRepository;
    private final AttendanceRepository attendanceRepository;
    private final com.exam.seating.service.AuditLogService auditLogService;

    @Override
    public SeatingGenerationResponseDto generateSeatingArrangement(Long examId, GenerateSeatingRequestDto requestDto) {
        // 1. Verify exam exists
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        // 2. Prevent accidental duplicate generation
        if (seatingArrangementRepository.countByExamId(examId) > 0) {
            throw new BadRequestException("Seating arrangement already exists for this exam. Use regenerate endpoint to recreate.");
        }

        return executeGeneration(exam, requestDto);
    }

    @Override
    public SeatingGenerationResponseDto regenerateSeatingArrangement(Long examId, GenerateSeatingRequestDto requestDto) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        // Reset previous attendance and seating allocations cleanly
        attendanceRepository.deleteByExamId(examId);
        seatingArrangementRepository.deleteByExamId(examId);
        seatingArrangementRepository.flush();

        return executeGeneration(exam, requestDto);
    }

    @Override
    @Transactional(readOnly = true)
    public com.exam.seating.dto.response.ConflictCheckResponseDto validateConflicts(Long examId, List<Long> hallIds) {
        Exam exam = examRepository.findById(examId).orElse(null);
        com.exam.seating.dto.response.ConflictCheckResponseDto response = new com.exam.seating.dto.response.ConflictCheckResponseDto();
        List<com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto> conflicts = new ArrayList<>();

        if (exam == null) {
            conflicts.add(com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto.builder()
                    .type("INVALID_EXAM")
                    .severity("ERROR")
                    .message("Examination with ID " + examId + " does not exist.")
                    .build());
            response.setHasConflicts(true);
            response.setConflicts(conflicts);
            return response;
        }

        // 1. Eligible Students
        List<ExamStudent> examStudents = examStudentRepository.findByExamIdWithStudent(examId);
        response.setEligibleStudentCount(examStudents.size());

        if (examStudents.isEmpty()) {
            conflicts.add(com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto.builder()
                    .type("NO_STUDENTS")
                    .severity("ERROR")
                    .message("No students are enrolled in this examination.")
                    .build());
        }

        // Duplicate enrollment check
        Set<Long> studentIds = new HashSet<>();
        for (ExamStudent es : examStudents) {
            if (es.getStudent() != null && !studentIds.add(es.getStudent().getId())) {
                conflicts.add(com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto.builder()
                        .type("DUPLICATE_ASSIGNMENT")
                        .severity("ERROR")
                        .message("Student " + es.getStudent().getRegisterNumber() + " is registered multiple times.")
                        .build());
            }
        }

        // 2. Validate Halls & Available Seats
        List<Seat> availableSeats;
        List<Long> targetHallIds = (hallIds != null && !hallIds.isEmpty())
                ? hallIds
                : (exam.getAllottedHalls() != null && !exam.getAllottedHalls().isEmpty()
                    ? exam.getAllottedHalls().stream().map(Hall::getId).sorted().collect(Collectors.toList())
                    : null);

        if (targetHallIds != null && !targetHallIds.isEmpty()) {
            for (Long hId : targetHallIds) {
                Optional<Hall> h = hallRepository.findById(hId);
                if (h.isEmpty()) {
                    conflicts.add(com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto.builder()
                            .type("INVALID_HALL")
                            .severity("ERROR")
                            .message("Specified hall ID " + hId + " does not exist.")
                            .build());
                } else {
                    long seatCount = seatRepository.countByHallIdAndStatus(hId, SeatStatus.AVAILABLE);
                    if (seatCount == 0) {
                        conflicts.add(com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto.builder()
                                .type("INVALID_HALL")
                                .severity("WARNING")
                                .message("Hall " + h.get().getHallNumber() + " has zero available seats.")
                                .build());
                    }
                }
            }
            availableSeats = seatRepository.findByHallIdInAndStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(
                    targetHallIds, SeatStatus.AVAILABLE);
        } else {
            List<Hall> allHalls = hallRepository.findAll();
            if (allHalls.isEmpty()) {
                conflicts.add(com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto.builder()
                        .type("INVALID_HALL")
                        .severity("ERROR")
                        .message("No examination halls exist in the system.")
                        .build());
            }
            availableSeats = seatRepository.findByStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(SeatStatus.AVAILABLE);
        }

        response.setTotalAvailableSeats(availableSeats.size());
        int deficit = Math.max(0, examStudents.size() - availableSeats.size());
        response.setDeficitSeats(deficit);

        // 3. Insufficient Seats
        if (examStudents.size() > availableSeats.size()) {
            conflicts.add(com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto.builder()
                    .type("INSUFFICIENT_SEATS")
                    .severity("ERROR")
                    .message(String.format("Insufficient seats! Required: %d, Available: %d (Shortage: %d seats).",
                            examStudents.size(), availableSeats.size(), deficit))
                    .build());
        }

        // 4. Duplicate Seat Check in Available Seats
        Set<Long> seatIds = new HashSet<>();
        for (Seat s : availableSeats) {
            if (!seatIds.add(s.getId())) {
                conflicts.add(com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto.builder()
                        .type("DUPLICATE_SEAT")
                        .severity("ERROR")
                        .message("Duplicate seat configuration detected for seat ID " + s.getId())
                        .build());
            }
        }

        // 5. Existing Seating Check
        long existingArrangements = seatingArrangementRepository.countByExamId(examId);
        response.setAlreadyGenerated(existingArrangements > 0);
        if (existingArrangements > 0) {
            conflicts.add(com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto.builder()
                    .type("ALREADY_ASSIGNED")
                    .severity("WARNING")
                    .message(String.format("Seating arrangement already generated (%d seats assigned). Use Regenerate to overwrite.",
                            existingArrangements))
                    .build());
        }

        // 6. Overlapping Exam Schedule Check
        if (exam.getExamDate() != null && exam.getStartTime() != null && exam.getEndTime() != null) {
            List<Exam> sameDateExams = examRepository.findAll().stream()
                    .filter(e -> !e.getId().equals(examId) && exam.getExamDate().equals(e.getExamDate()))
                    .filter(e -> e.getStartTime() != null && e.getEndTime() != null)
                    .filter(e -> e.getStartTime().isBefore(exam.getEndTime()) && e.getEndTime().isAfter(exam.getStartTime()))
                    .toList();

            for (Exam other : sameDateExams) {
                // Check hall overlap
                List<SeatingArrangement> otherArrangements = seatingArrangementRepository.findByExamId(other.getId());
                Set<Long> otherHallIds = otherArrangements.stream().map(a -> a.getHall().getId()).collect(Collectors.toSet());
                for (Seat s : availableSeats) {
                    if (otherHallIds.contains(s.getHall().getId())) {
                        conflicts.add(com.exam.seating.dto.response.ConflictCheckResponseDto.ConflictDetailDto.builder()
                                .type("HALL_OVERLAP")
                                .severity("WARNING")
                                .message(String.format("Hall %s has time overlap with concurrent exam '%s'.",
                                        s.getHall().getHallNumber(), other.getExamName()))
                                .build());
                        break;
                    }
                }
            }
        }

        response.setHasConflicts(conflicts.stream().anyMatch(c -> "ERROR".equalsIgnoreCase(c.getSeverity())));
        response.setConflicts(conflicts);
        return response;
    }

    private SeatingGenerationResponseDto executeGeneration(Exam exam, GenerateSeatingRequestDto requestDto) {
        Long examId = exam.getId();
        SeatingStrategy strategy = (requestDto != null && requestDto.getStrategy() != null)
                ? requestDto.getStrategy()
                : SeatingStrategy.SEQUENTIAL;

        // 3. Fetch eligible students registered for this exam
        List<ExamStudent> examStudents = examStudentRepository.findByExamIdWithStudent(examId);
        if (examStudents.isEmpty()) {
            throw new BadRequestException("No eligible students registered for this exam.");
        }

        List<Student> students = examStudents.stream()
                .map(ExamStudent::getStudent)
                .collect(Collectors.toList());

        // 4. Determine target halls and available seats
        List<Seat> availableSeats;
        List<Long> targetHallIds = (requestDto != null && requestDto.getHallIds() != null && !requestDto.getHallIds().isEmpty())
                ? requestDto.getHallIds()
                : (exam.getAllottedHalls() != null && !exam.getAllottedHalls().isEmpty()
                    ? exam.getAllottedHalls().stream().map(Hall::getId).sorted().collect(Collectors.toList())
                    : null);

        if (targetHallIds != null && !targetHallIds.isEmpty()) {
            // Verify all specified halls exist
            for (Long hallId : targetHallIds) {
                if (!hallRepository.existsById(hallId)) {
                    throw new ResourceNotFoundException("Hall", "id", hallId);
                }
            }
            availableSeats = seatRepository.findByHallIdInAndStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(
                    targetHallIds, SeatStatus.AVAILABLE);

            // Dynamic multi-hall overflow: If students exceed allotted hall capacity, sequentially include remaining halls
            if (students.size() > availableSeats.size()) {
                List<Hall> remainingHalls = hallRepository.findAll().stream()
                        .filter(h -> !targetHallIds.contains(h.getId()))
                        .sorted(Comparator.comparing(Hall::getId))
                        .toList();
                for (Hall extraHall : remainingHalls) {
                    List<Seat> extraSeats = seatRepository.findByHallIdInAndStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(
                            List.of(extraHall.getId()), SeatStatus.AVAILABLE);
                    availableSeats.addAll(extraSeats);
                    if (availableSeats.size() >= students.size()) {
                        break;
                    }
                }
            }
        } else {
            List<Hall> allHalls = hallRepository.findAll();
            if (allHalls.isEmpty()) {
                throw new BadRequestException("No examination halls available for seating arrangement.");
            }
            availableSeats = seatRepository.findByStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(SeatStatus.AVAILABLE);
        }

        if (availableSeats.isEmpty()) {
            throw new BadRequestException("No available seats in the selected examination halls.");
        }

        // 5. Core validation: Check capacity
        int requiredSeats = students.size();
        int availableSeatCount = availableSeats.size();
        if (requiredSeats > availableSeatCount) {
            throw new BadRequestException(String.format(
                    "Not enough seats available. Required: %d, Available: %d.",
                    requiredSeats, availableSeatCount
            ));
        }

        // 6. Apply strategy to order students
        List<Student> orderedStudents = (strategy == SeatingStrategy.ADJACENT_BRANCH_SEPARATION)
                ? applyAdjacentBranchSeparation(students, availableSeats)
                : applyStrategy(students, strategy);

        // 7. Allocate ordered students to available seats sequentially
        List<SeatingArrangement> arrangements = new ArrayList<>();
        for (int i = 0; i < orderedStudents.size(); i++) {
            Student student = orderedStudents.get(i);
            Seat seat = availableSeats.get(i);

            SeatingArrangement arrangement = SeatingArrangement.builder()
                    .exam(exam)
                    .student(student)
                    .hall(seat.getHall())
                    .seat(seat)
                    .build();
            arrangements.add(arrangement);
        }

        seatingArrangementRepository.saveAll(arrangements);

        int hallsUsed = (int) arrangements.stream()
                .map(a -> a.getHall().getId())
                .distinct()
                .count();

        auditLogService.logCurrentUser(
                "GENERATE_SEATING",
                "Exam #" + exam.getId() + " (" + exam.getExamName() + ")",
                "Generated seating arrangement: " + arrangements.size() + " students across " + hallsUsed + " halls using strategy " + strategy
        );

        return SeatingGenerationResponseDto.builder()
                .examId(exam.getId())
                .examName(exam.getExamName())
                .totalStudents(arrangements.size())
                .totalSeatsUsed(arrangements.size())
                .hallsUsed(hallsUsed)
                .strategy(strategy)
                .build();
    }

    /**
     * Orders students to prevent candidates from the same branch sitting directly beside each other in adjacent desks.
     */
    private List<Student> applyAdjacentBranchSeparation(List<Student> students, List<Seat> availableSeats) {
        Map<String, Queue<Student>> branchQueues = new LinkedHashMap<>();
        List<String> branches = students.stream()
                .map(s -> s.getBranch() != null ? s.getBranch().trim().toUpperCase() : "GENERAL")
                .distinct()
                .sorted()
                .toList();

        for (String branch : branches) {
            List<Student> group = students.stream()
                    .filter(s -> (s.getBranch() != null ? s.getBranch().trim().toUpperCase() : "GENERAL").equals(branch))
                    .sorted(Comparator.comparing(Student::getRegisterNumber))
                    .toList();
            branchQueues.put(branch, new LinkedList<>(group));
        }

        List<Student> ordered = new ArrayList<>();
        String previousBranch = null;
        Seat previousSeat = null;

        for (int i = 0; i < students.size(); i++) {
            Seat currentSeat = availableSeats.get(i);
            boolean isBesidePrevious = (previousSeat != null
                    && previousSeat.getHall().getId().equals(currentSeat.getHall().getId())
                    && previousSeat.getRowNumber().equals(currentSeat.getRowNumber())
                    && currentSeat.getColumnNumber() == previousSeat.getColumnNumber() + 1);

            String chosenBranch = null;
            int maxRemaining = -1;

            // First priority: Select a branch different from adjacent neighbor with largest remaining candidates
            for (Map.Entry<String, Queue<Student>> entry : branchQueues.entrySet()) {
                String branch = entry.getKey();
                Queue<Student> queue = entry.getValue();
                if (queue.isEmpty()) continue;

                if (isBesidePrevious && branch.equalsIgnoreCase(previousBranch)) {
                    continue; // Avoid same branch in adjacent desk
                }

                if (queue.size() > maxRemaining) {
                    maxRemaining = queue.size();
                    chosenBranch = branch;
                }
            }

            // Fallback: If only the same branch has candidates left, allocate them gracefully
            if (chosenBranch == null) {
                for (Map.Entry<String, Queue<Student>> entry : branchQueues.entrySet()) {
                    if (!entry.getValue().isEmpty()) {
                        chosenBranch = entry.getKey();
                        break;
                    }
                }
            }

            Student chosenStudent = branchQueues.get(chosenBranch).poll();
            ordered.add(chosenStudent);
            previousBranch = (chosenStudent.getBranch() != null ? chosenStudent.getBranch().trim().toUpperCase() : "GENERAL");
            previousSeat = currentSeat;
        }

        return ordered;
    }

    /**
     * Orders students according to the selected seating strategy.
     */
    private List<Student> applyStrategy(List<Student> students, SeatingStrategy strategy) {
        List<Student> list = new ArrayList<>(students);

        switch (strategy) {
            case SEQUENTIAL -> {
                list.sort(Comparator.comparing(Student::getRegisterNumber));
                return list;
            }
            case RANDOM -> {
                Collections.shuffle(list, new Random());
                return list;
            }
            case BRANCH_ALTERNATION -> {
                return interleaveByField(list, Student::getBranch);
            }
            case SECTION_ALTERNATION -> {
                return interleaveByField(list, Student::getSection);
            }
            default -> {
                list.sort(Comparator.comparing(Student::getRegisterNumber));
                return list;
            }
        }
    }

    /**
     * Interleaves students across distinct categories (e.g. Branch or Section)
     * using a round-robin queue approach.
     */
    private List<Student> interleaveByField(List<Student> students, java.util.function.Function<Student, String> keyExtractor) {
        // Group students by category key in sorted order
        Map<String, Queue<Student>> queueMap = new LinkedHashMap<>();
        List<String> distinctKeys = students.stream()
                .map(keyExtractor)
                .map(s -> s == null ? "DEFAULT" : s.trim().toUpperCase())
                .distinct()
                .sorted()
                .toList();

        for (String key : distinctKeys) {
            List<Student> group = students.stream()
                    .filter(s -> {
                        String k = keyExtractor.apply(s);
                        return (k == null ? "DEFAULT" : k.trim().toUpperCase()).equals(key);
                    })
                    .sorted(Comparator.comparing(Student::getRegisterNumber))
                    .toList();
            queueMap.put(key, new LinkedList<>(group));
        }

        List<Student> interleaved = new ArrayList<>();
        boolean hasMore = true;
        while (hasMore) {
            hasMore = false;
            for (Queue<Student> queue : queueMap.values()) {
                if (!queue.isEmpty()) {
                    interleaved.add(queue.poll());
                    hasMore = true;
                }
            }
        }
        return interleaved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatingArrangementDetailDto> getArrangementByExamId(Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new ResourceNotFoundException("Exam", "id", examId);
        }
        return seatingArrangementRepository.findFullArrangementByExamId(examId).stream()
                .map(this::mapToDetailDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatingArrangementDetailDto> getArrangementByHallAndExam(Long hallId, Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new ResourceNotFoundException("Exam", "id", examId);
        }
        if (!hallRepository.existsById(hallId)) {
            throw new ResourceNotFoundException("Hall", "id", hallId);
        }
        return seatingArrangementRepository.findArrangementDetailsByExamAndHall(examId, hallId).stream()
                .map(this::mapToDetailDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentSeatSearchResponseDto searchStudentSeat(String registerNumber, Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new ResourceNotFoundException("Exam", "id", examId);
        }

        SeatingArrangement arrangement = seatingArrangementRepository
                .findByExamIdAndStudentRegisterNumber(examId, registerNumber.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("No seating arrangement found for student with register number '%s' in exam ID %d",
                                registerNumber, examId)));

        return StudentSeatSearchResponseDto.builder()
                .studentName(arrangement.getStudent().getName())
                .registerNumber(arrangement.getStudent().getRegisterNumber())
                .exam(arrangement.getExam().getExamName())
                .date(arrangement.getExam().getExamDate())
                .hall(arrangement.getHall().getHallNumber())
                .hallRows(arrangement.getHall().getRowsCount())
                .hallColumns(arrangement.getHall().getColumnsCount())
                .row(arrangement.getSeat().getRowNumber())
                .column(arrangement.getSeat().getColumnNumber())
                .seat(arrangement.getSeat().getSeatNumber())
                .build();
    }

    @Override
    public void deleteArrangementByExamId(Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new ResourceNotFoundException("Exam", "id", examId);
        }
        seatingArrangementRepository.deleteByExamId(examId);
    }

    private SeatingArrangementDetailDto mapToDetailDto(SeatingArrangement sa) {
        return SeatingArrangementDetailDto.builder()
                .id(sa.getId())
                .examId(sa.getExam().getId())
                .examName(sa.getExam().getExamName())
                .studentId(sa.getStudent().getId())
                .studentRegisterNumber(sa.getStudent().getRegisterNumber())
                .studentName(sa.getStudent().getName())
                .studentBranch(sa.getStudent().getBranch())
                .studentSection(sa.getStudent().getSection())
                .hallId(sa.getHall().getId())
                .hallNumber(sa.getHall().getHallNumber())
                .building(sa.getHall().getBuilding())
                .seatId(sa.getSeat().getId())
                .seatNumber(sa.getSeat().getSeatNumber())
                .rowNumber(sa.getSeat().getRowNumber())
                .columnNumber(sa.getSeat().getColumnNumber())
                .arrangementDate(sa.getArrangementDate())
                .build();
    }
}
