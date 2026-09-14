package com.exam.seating.service.impl;

import com.exam.seating.dto.AttendanceReportResponse;
import com.exam.seating.dto.ExamWiseReportResponse;
import com.exam.seating.dto.HallWiseReportResponse;
import com.exam.seating.dto.StudentWiseReportResponse;
import com.exam.seating.entity.*;
import com.exam.seating.entity.enums.AttendanceStatus;
import com.exam.seating.repository.*;
import com.exam.seating.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final ExamRepository examRepository;
    private final HallRepository hallRepository;
    private final ExamStudentRepository examStudentRepository;
    private final SeatingArrangementRepository seatingArrangementRepository;
    private final AttendanceRepository attendanceRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SeatRepository seatRepository;

    @Override
    public List<ExamWiseReportResponse> getExamWiseReport() {
        List<Exam> exams = examRepository.findAll();
        List<ExamWiseReportResponse> reports = new ArrayList<>();

        for (Exam exam : exams) {
            int enrolled = examStudentRepository.findByExamId(exam.getId()).size();
            List<SeatingArrangement> arrangements = seatingArrangementRepository.findByExamId(exam.getId());
            int seatsAssigned = arrangements.size();
            int hallsCount = (int) arrangements.stream().map(sa -> sa.getHall().getId()).distinct().count();

            int present = (int) attendanceRepository.countByExamIdAndStatus(exam.getId(), AttendanceStatus.PRESENT);
            int absent = (int) attendanceRepository.countByExamIdAndStatus(exam.getId(), AttendanceStatus.ABSENT);

            double attPercent = seatsAssigned > 0
                    ? Math.round(((double) present / seatsAssigned) * 1000.0) / 10.0
                    : 0.0;

            String timeSlot = (exam.getStartTime() != null ? exam.getStartTime().toString() : "")
                    + " - " + (exam.getEndTime() != null ? exam.getEndTime().toString() : "");

            reports.add(ExamWiseReportResponse.builder()
                    .examId(exam.getId())
                    .examName(exam.getExamName())
                    .subject(exam.getSubject())
                    .examDate(exam.getExamDate())
                    .timeSlot(timeSlot)
                    .enrolledStudentsCount(enrolled)
                    .hallsUsedCount(hallsCount)
                    .totalSeatsAssigned(seatsAssigned)
                    .presentCount(present)
                    .absentCount(absent)
                    .attendancePercentage(attPercent)
                    .status(exam.getStatus() != null ? exam.getStatus().name() : "SCHEDULED")
                    .build());
        }

        return reports;
    }

    @Override
    public List<HallWiseReportResponse> getHallWiseReport(Long examId, Long hallId) {
        List<Hall> halls = (hallId != null)
                ? hallRepository.findById(hallId).map(List::of).orElse(Collections.emptyList())
                : hallRepository.findAll();

        List<Exam> exams = (examId != null)
                ? examRepository.findById(examId).map(List::of).orElse(Collections.emptyList())
                : examRepository.findAll();

        List<HallWiseReportResponse> result = new ArrayList<>();

        for (Exam exam : exams) {
            for (Hall hall : halls) {
                List<SeatingArrangement> arrangements = seatingArrangementRepository.findArrangementDetailsByExamAndHall(exam.getId(), hall.getId());
                if (arrangements.isEmpty()) {
                    continue; // Skip halls not in use for this exam
                }

                int studentCount = arrangements.size();
                double occupancy = hall.getCapacity() > 0
                        ? Math.round(((double) studentCount / hall.getCapacity()) * 1000.0) / 10.0
                        : 0.0;

                // Check assigned faculty
                List<FacultyAssignment> dutyAssignments = facultyAssignmentRepository.findByExamIdAndHallId(exam.getId(), hall.getId());
                String facultyName = dutyAssignments.isEmpty() ? "Unassigned" : dutyAssignments.get(0).getFaculty().getName();
                String facultyEmpId = dutyAssignments.isEmpty() ? "-" : dutyAssignments.get(0).getFaculty().getEmployeeId();

                List<HallWiseReportResponse.SeatAssignmentItem> seatItems = arrangements.stream()
                        .map(sa -> HallWiseReportResponse.SeatAssignmentItem.builder()
                                .seatNumber(sa.getSeat().getSeatNumber())
                                .rowNumber(sa.getSeat().getRowNumber())
                                .columnNumber(sa.getSeat().getColumnNumber())
                                .studentRegisterNumber(sa.getStudent().getRegisterNumber())
                                .studentName(sa.getStudent().getName())
                                .branch(sa.getStudent().getBranch())
                                .build())
                        .collect(Collectors.toList());

                result.add(HallWiseReportResponse.builder()
                        .hallId(hall.getId())
                        .hallNumber(hall.getHallNumber())
                        .building(hall.getBuilding())
                        .floor(hall.getFloor())
                        .capacity(hall.getCapacity())
                        .examId(exam.getId())
                        .examName(exam.getExamName())
                        .subject(exam.getSubject())
                        .studentCount(studentCount)
                        .occupancyPercentage(occupancy)
                        .assignedFacultyName(facultyName)
                        .assignedFacultyEmpId(facultyEmpId)
                        .seatAssignments(seatItems)
                        .build());
            }
        }

        return result;
    }

    @Override
    public List<StudentWiseReportResponse> getStudentWiseReport(Long examId, String keyword) {
        List<SeatingArrangement> list;
        if (examId != null) {
            list = seatingArrangementRepository.findFullArrangementByExamId(examId);
        } else {
            list = seatingArrangementRepository.findAll();
        }

        String search = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim().toLowerCase() : null;

        List<StudentWiseReportResponse> report = new ArrayList<>();
        for (SeatingArrangement sa : list) {
            Student s = sa.getStudent();
            Exam e = sa.getExam();
            Hall h = sa.getHall();
            Seat st = sa.getSeat();

            if (search != null) {
                boolean matchReg = s.getRegisterNumber() != null && s.getRegisterNumber().toLowerCase().contains(search);
                boolean matchName = s.getName() != null && s.getName().toLowerCase().contains(search);
                boolean matchBranch = s.getBranch() != null && s.getBranch().toLowerCase().contains(search);
                if (!matchReg && !matchName && !matchBranch) {
                    continue;
                }
            }

            Optional<Attendance> att = attendanceRepository.findByExamIdAndStudentId(e.getId(), s.getId());
            String status = att.map(a -> a.getStatus().name()).orElse("PRESENT");

            report.add(StudentWiseReportResponse.builder()
                    .registerNumber(s.getRegisterNumber())
                    .studentName(s.getName())
                    .branch(s.getBranch())
                    .year(s.getYear())
                    .section(s.getSection())
                    .examId(e.getId())
                    .examName(e.getExamName())
                    .subject(e.getSubject())
                    .examDate(e.getExamDate())
                    .hallNumber(h.getHallNumber())
                    .building(h.getBuilding())
                    .seatNumber(st.getSeatNumber())
                    .rowNumber(st.getRowNumber())
                    .columnNumber(st.getColumnNumber())
                    .attendanceStatus(status)
                    .build());
        }

        return report;
    }

    @Override
    public List<AttendanceReportResponse> getAttendanceReport(Long examId, LocalDate date) {
        List<Exam> exams;
        if (examId != null) {
            exams = examRepository.findById(examId).map(List::of).orElse(Collections.emptyList());
        } else if (date != null) {
            exams = examRepository.findAll().stream()
                    .filter(e -> date.equals(e.getExamDate()))
                    .collect(Collectors.toList());
        } else {
            exams = examRepository.findAll();
        }

        List<AttendanceReportResponse> result = new ArrayList<>();
        for (Exam exam : exams) {
            List<Hall> hallsInExam = seatingArrangementRepository.findByExamId(exam.getId()).stream()
                    .map(SeatingArrangement::getHall)
                    .distinct()
                    .collect(Collectors.toList());

            for (Hall hall : hallsInExam) {
                List<SeatingArrangement> assigned = seatingArrangementRepository.findArrangementDetailsByExamAndHall(exam.getId(), hall.getId());
                int total = assigned.size();
                if (total == 0) continue;

                List<Attendance> hallAttendance = attendanceRepository.findByExamIdAndHallId(exam.getId(), hall.getId());
                int present = (int) hallAttendance.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
                int absent = (int) hallAttendance.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
                int malpractice = (int) hallAttendance.stream().filter(a -> a.getStatus() == AttendanceStatus.MALPRACTICE).count();

                // If not yet persisted, default to all present
                if (hallAttendance.isEmpty()) {
                    present = total;
                }

                double percentage = total > 0 ? Math.round(((double) present / total) * 1000.0) / 10.0 : 0.0;

                result.add(AttendanceReportResponse.builder()
                        .examId(exam.getId())
                        .examName(exam.getExamName())
                        .subject(exam.getSubject())
                        .examDate(exam.getExamDate())
                        .hallId(hall.getId())
                        .hallNumber(hall.getHallNumber())
                        .building(hall.getBuilding())
                        .totalStudents(total)
                        .present(present)
                        .absent(absent)
                        .malpractice(malpractice)
                        .attendancePercentage(percentage)
                        .build());
            }
        }

        return result;
    }

    @Override
    public com.exam.seating.dto.response.DashboardStatsResponseDto getDashboardStats() {
        long totalStudents = studentRepository.count();
        long totalHalls = hallRepository.count();
        long totalExams = examRepository.count();
        long totalFaculty = facultyRepository.count();
        long totalSeats = seatRepository.count();
        long availableSeats = seatRepository.countByStatus(com.exam.seating.entity.enums.SeatStatus.AVAILABLE);
        long occupiedSeats = seatingArrangementRepository.count();

        LocalDate today = LocalDate.now();
        List<Exam> allExams = examRepository.findAll();
        List<Exam> upcoming = allExams.stream()
                .filter(e -> e.getExamDate() != null && !e.getExamDate().isBefore(today))
                .sorted(Comparator.comparing(Exam::getExamDate))
                .toList();

        // If no exams strictly >= today (e.g. sample test data with past dates), fallback to all exams sorted
        List<Exam> displayUpcoming = upcoming.isEmpty() ? allExams : upcoming;

        List<com.exam.seating.dto.response.DashboardStatsResponseDto.UpcomingExamDto> upcomingDtos = displayUpcoming.stream()
                .limit(5)
                .map(e -> {
                    int assigned = examStudentRepository.findByExamId(e.getId()).size();
                    return com.exam.seating.dto.response.DashboardStatsResponseDto.UpcomingExamDto.builder()
                            .id(e.getId())
                            .examCode(e.getSubject())
                            .title(e.getExamName())
                            .examDate(e.getExamDate())
                            .startTime(e.getStartTime())
                            .endTime(e.getEndTime())
                            .assignedStudents(assigned)
                            .status(e.getStatus() != null ? e.getStatus().name() : "SCHEDULED")
                            .build();
                })
                .toList();

        // Branch distribution
        Map<String, Long> branchDist = studentRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        s -> s.getBranch() != null ? s.getBranch() : "OTHER",
                        Collectors.counting()
                ));

        return com.exam.seating.dto.response.DashboardStatsResponseDto.builder()
                .totalStudents(totalStudents)
                .totalHalls(totalHalls)
                .totalExams(totalExams)
                .totalFaculty(totalFaculty)
                .totalSeats(totalSeats)
                .availableSeats(availableSeats)
                .occupiedSeats(occupiedSeats)
                .upcomingExamsCount(upcoming.size())
                .upcomingExams(upcomingDtos)
                .branchDistribution(branchDist)
                .build();
    }
}
