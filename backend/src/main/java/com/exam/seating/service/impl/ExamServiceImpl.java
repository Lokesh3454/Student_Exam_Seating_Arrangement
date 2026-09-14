package com.exam.seating.service.impl;

import com.exam.seating.dto.request.AssignStudentsRequestDto;
import com.exam.seating.dto.request.ExamRequestDto;
import com.exam.seating.dto.response.ExamResponseDto;
import com.exam.seating.dto.response.HallResponseDto;
import com.exam.seating.dto.response.StudentResponseDto;
import com.exam.seating.entity.Exam;
import com.exam.seating.entity.ExamStudent;
import com.exam.seating.entity.Hall;
import com.exam.seating.entity.Student;
import com.exam.seating.exception.BadRequestException;
import com.exam.seating.exception.DuplicateResourceException;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.ExamRepository;
import com.exam.seating.repository.ExamStudentRepository;
import com.exam.seating.repository.HallRepository;
import com.exam.seating.repository.StudentRepository;
import com.exam.seating.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final ExamStudentRepository examStudentRepository;
    private final StudentRepository studentRepository;
    private final HallRepository hallRepository;
    private final com.exam.seating.service.AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDto> getAllExams() {
        return examRepository.findAllWithHalls().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResponseDto getExamById(Long id) {
        Exam exam = examRepository.findByIdWithHalls(id)
                .orElseGet(() -> examRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", id)));
        return mapToDto(exam);
    }

    @Override
    public ExamResponseDto createExam(ExamRequestDto dto) {
        validateExamTimes(dto);

        Exam exam = Exam.builder()
                .examName(dto.getExamName().trim())
                .subject(dto.getSubject().trim())
                .examDate(dto.getExamDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status(dto.getStatus() != null ? dto.getStatus() : com.exam.seating.entity.enums.ExamStatus.SCHEDULED)
                .branch(dto.getBranch() != null && !dto.getBranch().isBlank() ? dto.getBranch().trim().toUpperCase() : "ALL")
                .build();

        if (dto.getHallIds() != null && !dto.getHallIds().isEmpty()) {
            List<Hall> halls = hallRepository.findAllById(dto.getHallIds());
            exam.setAllottedHalls(new HashSet<>(halls));
        }

        Exam savedExam = examRepository.save(exam);
        return mapToDto(savedExam);
    }

    @Override
    public ExamResponseDto updateExam(Long id, ExamRequestDto dto) {
        Exam existing = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", id));

        validateExamTimes(dto);

        existing.setExamName(dto.getExamName().trim());
        existing.setSubject(dto.getSubject().trim());
        existing.setExamDate(dto.getExamDate());
        existing.setStartTime(dto.getStartTime());
        existing.setEndTime(dto.getEndTime());
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }
        if (dto.getBranch() != null && !dto.getBranch().isBlank()) {
            existing.setBranch(dto.getBranch().trim().toUpperCase());
        }
        if (dto.getHallIds() != null) {
            List<Hall> halls = hallRepository.findAllById(dto.getHallIds());
            existing.setAllottedHalls(new HashSet<>(halls));
        }

        Exam updated = examRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", id));
        examStudentRepository.deleteByExamId(exam.getId());
        examRepository.delete(exam);
    }

    @Override
    public List<StudentResponseDto> assignStudentsToExam(Long examId, AssignStudentsRequestDto dto) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        List<StudentResponseDto> assignedList = new ArrayList<>();

        for (Long studentId : dto.getStudentIds()) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

            // Validate duplicate student assignment
            if (examStudentRepository.existsByExamIdAndStudentId(examId, studentId)) {
                throw new DuplicateResourceException(
                        String.format("Student with register number '%s' is already assigned to exam '%s'",
                                student.getRegisterNumber(), exam.getExamName()));
            }

            ExamStudent examStudent = ExamStudent.builder()
                    .exam(exam)
                    .student(student)
                    .build();

            examStudentRepository.save(examStudent);
            assignedList.add(mapStudentToDto(student));
        }

        return assignedList;
    }

    @Override
    public void removeStudentFromExam(Long examId, Long studentId) {
        if (!examRepository.existsById(examId)) {
            throw new ResourceNotFoundException("Exam", "id", examId);
        }
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }

        ExamStudent examStudent = examStudentRepository.findByExamIdAndStudentId(examId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Student ID %d is not assigned to Exam ID %d", studentId, examId)));

        examStudentRepository.delete(examStudent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDto> getStudentsByExamId(Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new ResourceNotFoundException("Exam", "id", examId);
        }

        return examStudentRepository.findByExamIdWithStudent(examId).stream()
                .map(es -> mapStudentToDto(es.getStudent()))
                .collect(Collectors.toList());
    }

    private void validateExamTimes(ExamRequestDto dto) {
        if (dto.getStartTime().isAfter(dto.getEndTime()) || dto.getStartTime().equals(dto.getEndTime())) {
            throw new BadRequestException("Exam start time must be before end time");
        }
    }

    private ExamResponseDto mapToDto(Exam exam) {
        long count = examStudentRepository.countByExamId(exam.getId());
        List<Long> allottedHallIds = new ArrayList<>();
        List<HallResponseDto> allottedHalls = new ArrayList<>();
        int totalCapacity = 0;

        if (exam.getAllottedHalls() != null) {
            for (Hall h : exam.getAllottedHalls()) {
                allottedHallIds.add(h.getId());
                allottedHalls.add(HallResponseDto.builder()
                        .id(h.getId())
                        .hallNumber(h.getHallNumber())
                        .building(h.getBuilding())
                        .floor(h.getFloor())
                        .rowsCount(h.getRowsCount())
                        .columnsCount(h.getColumnsCount())
                        .capacity(h.getCapacity())
                        .build());
                totalCapacity += (h.getCapacity() != null ? h.getCapacity() : 0);
            }
        }

        return ExamResponseDto.builder()
                .id(exam.getId())
                .examName(exam.getExamName())
                .subject(exam.getSubject())
                .examDate(exam.getExamDate())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .status(exam.getStatus())
                .branch(exam.getBranch() != null ? exam.getBranch() : "ALL")
                .allottedHallIds(allottedHallIds)
                .allottedHalls(allottedHalls)
                .allottedCapacity(totalCapacity)
                .registeredStudentsCount(count)
                .createdAt(exam.getCreatedAt())
                .updatedAt(exam.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDto> getExamsByBranch(String branch) {
        if (branch == null || branch.isBlank() || "ALL".equalsIgnoreCase(branch.trim())) {
            return getAllExams();
        }
        return examRepository.findByBranch(branch.trim().toUpperCase()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ExamResponseDto updateAllottedHalls(Long examId, List<Long> hallIds) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        if (hallIds != null && !hallIds.isEmpty()) {
            List<Hall> halls = hallRepository.findAllById(hallIds);
            exam.setAllottedHalls(new HashSet<>(halls));
        } else {
            exam.getAllottedHalls().clear();
        }

        Exam updated = examRepository.save(exam);
        return mapToDto(updated);
    }

    @Override
    public List<StudentResponseDto> autoEnrollStudentsByBranch(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        List<Student> eligibleStudents;
        String examBranch = exam.getBranch();
        if (examBranch == null || examBranch.isBlank() || "ALL".equalsIgnoreCase(examBranch.trim())) {
            eligibleStudents = studentRepository.findAll();
        } else {
            eligibleStudents = studentRepository.findByBranch(examBranch.trim().toUpperCase());
        }

        for (Student s : eligibleStudents) {
            if (!examStudentRepository.existsByExamIdAndStudentId(examId, s.getId())) {
                ExamStudent es = ExamStudent.builder()
                        .exam(exam)
                        .student(s)
                        .build();
                examStudentRepository.save(es);
            }
        }

        return getStudentsByExamId(examId);
    }

    private StudentResponseDto mapStudentToDto(Student student) {
        return StudentResponseDto.builder()
                .id(student.getId())
                .registerNumber(student.getRegisterNumber())
                .name(student.getName())
                .branch(student.getBranch())
                .year(student.getYear())
                .section(student.getSection())
                .email(student.getEmail())
                .phone(student.getPhone())
                .userId(student.getUser() != null ? student.getUser().getId() : null)
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }

    @Override
    public com.exam.seating.dto.response.ExamImportSummaryDto importExamsFromCsv(org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded CSV file is empty");
        }

        com.exam.seating.dto.response.ExamImportSummaryDto summary = new com.exam.seating.dto.response.ExamImportSummaryDto();
        java.util.Set<String> seenExamKeys = new java.util.HashSet<>();

        try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String line;
            int rowNumber = 0;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) {
                    continue;
                }

                rowNumber++;
                if (isHeader) {
                    isHeader = false;
                    if (line.toLowerCase().contains("examname") || line.toLowerCase().contains("subject")) {
                        continue;
                    }
                }

                summary.setTotalRows(summary.getTotalRows() + 1);
                String[] tokens = line.split(",");
                if (tokens.length < 5) {
                    summary.setFailedRows(summary.getFailedRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.ExamImportSummaryDto.ExamImportErrorDto(
                            rowNumber, tokens.length > 0 ? tokens[0].trim() : "ROW_" + rowNumber,
                            "Insufficient columns. Expected: examName, subject, examDate, startTime, endTime, [status]"
                    ));
                    continue;
                }

                String examName = tokens[0].trim();
                String subject = tokens[1].trim();
                String dateStr = tokens[2].trim();
                String startStr = tokens[3].trim();
                String endStr = tokens[4].trim();
                String statusStr = tokens.length > 5 ? tokens[5].trim() : "SCHEDULED";
                String branchStr = tokens.length > 6 && !tokens[6].trim().isEmpty() ? tokens[6].trim().toUpperCase() : "ALL";
                String hallsStr = tokens.length > 7 ? tokens[7].trim() : "";

                if (examName.isEmpty() || subject.isEmpty() || dateStr.isEmpty() || startStr.isEmpty() || endStr.isEmpty()) {
                    summary.setFailedRows(summary.getFailedRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.ExamImportSummaryDto.ExamImportErrorDto(
                            rowNumber, examName, "Missing required values in columns"
                    ));
                    continue;
                }

                String examKey = (examName + "|" + subject + "|" + dateStr).toUpperCase();
                if (seenExamKeys.contains(examKey)) {
                    summary.setDuplicateRows(summary.getDuplicateRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.ExamImportSummaryDto.ExamImportErrorDto(
                            rowNumber, examName, "Duplicate exam entry in uploaded file for subject on " + dateStr
                    ));
                    continue;
                }

                try {
                    java.time.LocalDate examDate = java.time.LocalDate.parse(dateStr);
                    java.time.LocalTime startTime = java.time.LocalTime.parse(startStr.length() == 5 ? startStr + ":00" : startStr);
                    java.time.LocalTime endTime = java.time.LocalTime.parse(endStr.length() == 5 ? endStr + ":00" : endStr);

                    if (!startTime.isBefore(endTime)) {
                        summary.setFailedRows(summary.getFailedRows() + 1);
                        summary.getErrors().add(new com.exam.seating.dto.response.ExamImportSummaryDto.ExamImportErrorDto(
                                rowNumber, examName, "Start time (" + startStr + ") must be before end time (" + endStr + ")"
                        ));
                        continue;
                    }

                    com.exam.seating.entity.enums.ExamStatus status = com.exam.seating.entity.enums.ExamStatus.SCHEDULED;
                    if (!statusStr.isEmpty()) {
                        try {
                            status = com.exam.seating.entity.enums.ExamStatus.valueOf(statusStr.toUpperCase());
                        } catch (IllegalArgumentException e) {
                            status = com.exam.seating.entity.enums.ExamStatus.SCHEDULED;
                        }
                    }

                    Exam exam = Exam.builder()
                            .examName(examName)
                            .subject(subject)
                            .examDate(examDate)
                            .startTime(startTime)
                            .endTime(endTime)
                            .status(status)
                            .branch(branchStr)
                            .build();

                    if (!hallsStr.isEmpty()) {
                        String[] hallNames = hallsStr.split("[;,]");
                        Set<Hall> matchedHalls = new HashSet<>();
                        for (String hn : hallNames) {
                            String trimmedHn = hn.trim();
                            if (!trimmedHn.isEmpty()) {
                                hallRepository.findByHallNumber(trimmedHn).ifPresent(matchedHalls::add);
                            }
                        }
                        exam.setAllottedHalls(matchedHalls);
                    }

                    examRepository.save(exam);
                    seenExamKeys.add(examKey);
                    summary.setSuccessfullyImported(summary.getSuccessfullyImported() + 1);
                } catch (Exception e) {
                    summary.setFailedRows(summary.getFailedRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.ExamImportSummaryDto.ExamImportErrorDto(
                            rowNumber, examName, "Format error (Date YYYY-MM-DD or Time HH:mm): " + e.getMessage()
                    ));
                }
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }

        // Log Audit Event
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = (auth != null && auth.getName() != null) ? auth.getName() : "system";
        String currentRole = (auth != null && !auth.getAuthorities().isEmpty())
                ? auth.getAuthorities().iterator().next().getAuthority() : "ROLE_ADMIN";

        auditLogService.log(currentUsername, currentRole, "BULK_IMPORT_EXAMS",
                "Exams (" + summary.getSuccessfullyImported() + " created)",
                "Bulk import completed. Total processed: " + summary.getTotalRows()
                        + ", Successfully scheduled: " + summary.getSuccessfullyImported()
                        + ", Failed: " + summary.getFailedRows()
                        + ", Duplicates: " + summary.getDuplicateRows());

        return summary;
    }

    @Override
    public String getExamCsvTemplate() {
        return "examName,subject,examDate,startTime,endTime,status,branch,allottedHalls\n" +
                "Data Structures & Algorithms,CS301,2026-11-10,09:30,12:30,SCHEDULED,CSE,LH-101;LH-102;LH-201;LH-202\n" +
                "Digital Signal Processing,EC301,2026-11-10,09:30,12:30,SCHEDULED,ECE,LH-201;LH-301\n" +
                "Thermodynamics & Heat Transfer,ME301,2026-11-10,09:30,12:30,SCHEDULED,MECH,LH-202;LH-301\n" +
                "Structural Analysis & Design,CE301,2026-11-10,09:30,12:30,SCHEDULED,CIVIL,LH-101;LH-102\n" +
                "Database Management Systems,CS302,2026-11-12,14:00,17:00,SCHEDULED,CSE,LH-101;LH-102;LH-201\n" +
                "VLSI Design & Embedded Systems,EC302,2026-11-12,14:00,17:00,SCHEDULED,ECE,LH-201;LH-301\n" +
                "Fluid Mechanics & Machinery,ME302,2026-11-12,14:00,17:00,SCHEDULED,MECH,LH-202;LH-301\n" +
                "Geotechnical Engineering,CE302,2026-11-12,14:00,17:00,SCHEDULED,CIVIL,LH-101;LH-102\n" +
                "Computer Networks & Security,CS303,2026-11-14,09:30,12:30,SCHEDULED,CSE,LH-101;LH-102;LH-201;LH-202\n" +
                "Microprocessors & Interfacing,EC303,2026-11-14,09:30,12:30,SCHEDULED,ECE,LH-201;LH-301\n" +
                "Kinematics & Dynamics of Machines,ME303,2026-11-14,09:30,12:30,SCHEDULED,MECH,LH-202;LH-301\n" +
                "Transportation & Highway Engg,CE303,2026-11-14,09:30,12:30,SCHEDULED,CIVIL,LH-101;LH-102\n";
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.exam.seating.dto.response.ConcurrentExamSessionDto> getConcurrentExamSessions() {
        List<Exam> allExams = examRepository.findAllWithHalls();

        // Group exams by (examDate, startTime, endTime)
        Map<String, List<Exam>> sessionGroups = new LinkedHashMap<>();
        for (Exam exam : allExams) {
            if (exam.getExamDate() != null && exam.getStartTime() != null && exam.getEndTime() != null) {
                String key = exam.getExamDate().toString() + "_" + exam.getStartTime().toString() + "_" + exam.getEndTime().toString();
                sessionGroups.computeIfAbsent(key, k -> new ArrayList<>()).add(exam);
            }
        }

        List<com.exam.seating.dto.response.ConcurrentExamSessionDto> sessions = new ArrayList<>();
        for (List<Exam> group : sessionGroups.values()) {
            Exam first = group.get(0);
            List<ExamResponseDto> branchExams = group.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());

            int totalEnrolled = (int) group.stream()
                    .mapToLong(e -> examStudentRepository.countByExamId(e.getId()))
                    .sum();

            int totalAllottedCap = group.stream()
                    .mapToInt(e -> e.getAllottedHalls() != null
                            ? e.getAllottedHalls().stream().mapToInt(h -> h.getCapacity() != null ? h.getCapacity() : 15).sum()
                            : 0)
                    .sum();

            java.util.Set<String> branches = group.stream()
                    .map(e -> e.getBranch() != null ? e.getBranch().trim().toUpperCase() : "ALL")
                    .collect(Collectors.toSet());

            String label = first.getExamDate() + " (" + first.getStartTime() + " - " + first.getEndTime() + ")";

            sessions.add(com.exam.seating.dto.response.ConcurrentExamSessionDto.builder()
                    .sessionDate(first.getExamDate())
                    .startTime(first.getStartTime())
                    .endTime(first.getEndTime())
                    .sessionLabel(label)
                    .totalBranches(branches.size())
                    .branchExams(branchExams)
                    .totalEnrolled(totalEnrolled)
                    .totalAllottedCapacity(totalAllottedCap)
                    .build());
        }

        // Sort by session date then start time
        sessions.sort(Comparator.comparing(com.exam.seating.dto.response.ConcurrentExamSessionDto::getSessionDate)
                .thenComparing(com.exam.seating.dto.response.ConcurrentExamSessionDto::getStartTime));

        return sessions;
    }
}
