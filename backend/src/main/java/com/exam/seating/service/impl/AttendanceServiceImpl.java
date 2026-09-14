package com.exam.seating.service.impl;

import com.exam.seating.dto.AttendanceStudentDto;
import com.exam.seating.dto.HallAttendanceResponse;
import com.exam.seating.dto.SaveAttendanceRequest;
import com.exam.seating.entity.*;
import com.exam.seating.entity.enums.AttendanceStatus;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.*;
import com.exam.seating.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ExamRepository examRepository;
    private final HallRepository hallRepository;
    private final StudentRepository studentRepository;
    private final SeatingArrangementRepository seatingArrangementRepository;

    @Override
    @Transactional(readOnly = true)
    public HallAttendanceResponse getHallAttendance(Long examId, Long hallId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        Hall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + hallId));

        // 1. Fetch all assigned seats in this hall for this exam
        List<SeatingArrangement> arrangements = seatingArrangementRepository.findArrangementDetailsByExamAndHall(examId, hallId);

        // 2. Fetch all recorded attendance entries for this exam & hall
        List<Attendance> recordedList = attendanceRepository.findByExamIdAndHallId(examId, hallId);
        Map<Long, Attendance> attendanceMap = recordedList.stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), a -> a, (existing, replacement) -> existing));

        List<AttendanceStudentDto> studentDtos = new ArrayList<>();
        int presentCount = 0;
        int absentCount = 0;

        for (SeatingArrangement sa : arrangements) {
            Student s = sa.getStudent();
            Seat seat = sa.getSeat();
            Attendance att = attendanceMap.get(s.getId());

            AttendanceStatus status = (att != null) ? att.getStatus() : AttendanceStatus.PRESENT;
            if (status == AttendanceStatus.PRESENT) {
                presentCount++;
            } else if (status == AttendanceStatus.ABSENT) {
                absentCount++;
            }

            studentDtos.add(AttendanceStudentDto.builder()
                    .attendanceId(att != null ? att.getId() : null)
                    .studentId(s.getId())
                    .registerNumber(s.getRegisterNumber())
                    .studentName(s.getName())
                    .branch(s.getBranch())
                    .year(s.getYear())
                    .section(s.getSection())
                    .seatNumber(seat.getSeatNumber())
                    .rowNumber(seat.getRowNumber())
                    .columnNumber(seat.getColumnNumber())
                    .status(status)
                    .markedAt(att != null ? att.getMarkedAt() : null)
                    .build());
        }

        int total = arrangements.size();
        double percentage = total > 0 ? Math.round(((double) presentCount / total) * 1000.0) / 10.0 : 0.0;

        return HallAttendanceResponse.builder()
                .examId(exam.getId())
                .examName(exam.getExamName())
                .subject(exam.getSubject())
                .examDate(exam.getExamDate())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .hallId(hall.getId())
                .hallNumber(hall.getHallNumber())
                .building(hall.getBuilding())
                .floor(hall.getFloor())
                .capacity(hall.getCapacity())
                .totalStudents(total)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .attendancePercentage(percentage)
                .students(studentDtos)
                .build();
    }

    @Override
    public HallAttendanceResponse saveAttendance(SaveAttendanceRequest request) {
        log.info("Saving attendance for exam ID {} and hall ID {} with {} records",
                request.getExamId(), request.getHallId(), request.getRecords() != null ? request.getRecords().size() : 0);

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + request.getExamId()));

        Hall hall = hallRepository.findById(request.getHallId())
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found: " + request.getHallId()));

        if (request.getRecords() != null) {
            for (SaveAttendanceRequest.StudentStatusEntry entry : request.getRecords()) {
                Student student = studentRepository.findById(entry.getStudentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + entry.getStudentId()));

                Optional<Attendance> existing = attendanceRepository.findByExamIdAndStudentId(exam.getId(), student.getId());
                if (existing.isPresent()) {
                    Attendance att = existing.get();
                    att.setStatus(entry.getStatus());
                    att.setHall(hall);
                    att.setMarkedAt(LocalDateTime.now());
                    attendanceRepository.save(att);
                } else {
                    Attendance newAtt = Attendance.builder()
                            .exam(exam)
                            .student(student)
                            .hall(hall)
                            .status(entry.getStatus())
                            .markedAt(LocalDateTime.now())
                            .build();
                    attendanceRepository.save(newAtt);
                }
            }
        }

        return getHallAttendance(request.getExamId(), request.getHallId());
    }

    @Override
    public AttendanceStudentDto updateAttendanceStatus(Long id, AttendanceStatus status) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));

        attendance.setStatus(status);
        attendance.setMarkedAt(LocalDateTime.now());
        Attendance updated = attendanceRepository.save(attendance);

        Student s = updated.getStudent();
        return AttendanceStudentDto.builder()
                .attendanceId(updated.getId())
                .studentId(s.getId())
                .registerNumber(s.getRegisterNumber())
                .studentName(s.getName())
                .branch(s.getBranch())
                .year(s.getYear())
                .section(s.getSection())
                .status(updated.getStatus())
                .markedAt(updated.getMarkedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getExamAttendanceSummary(Long examId) {
        long totalEnrolled = seatingArrangementRepository.countByExamId(examId);
        long present = attendanceRepository.countByExamIdAndStatus(examId, AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByExamIdAndStatus(examId, AttendanceStatus.ABSENT);
        long malpractice = attendanceRepository.countByExamIdAndStatus(examId, AttendanceStatus.MALPRACTICE);

        double percentage = totalEnrolled > 0 ? Math.round(((double) present / totalEnrolled) * 1000.0) / 10.0 : 0.0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("examId", examId);
        summary.put("totalStudents", totalEnrolled);
        summary.put("present", present);
        summary.put("absent", absent);
        summary.put("malpractice", malpractice);
        summary.put("attendancePercentage", percentage);

        return summary;
    }
}
