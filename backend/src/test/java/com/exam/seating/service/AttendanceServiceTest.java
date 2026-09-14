package com.exam.seating.service;

import com.exam.seating.dto.AttendanceStudentDto;
import com.exam.seating.dto.HallAttendanceResponse;
import com.exam.seating.dto.SaveAttendanceRequest;
import com.exam.seating.entity.*;
import com.exam.seating.entity.enums.AttendanceStatus;
import com.exam.seating.repository.*;
import com.exam.seating.service.impl.AttendanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private ExamRepository examRepository;
    @Mock
    private HallRepository hallRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private SeatingArrangementRepository seatingArrangementRepository;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private Exam exam;
    private Hall hall;
    private Student student1;
    private Seat seat1;

    @BeforeEach
    void setUp() {
        exam = Exam.builder().id(1L).examName("Java Programming").subject("CS201").examDate(LocalDate.now()).startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(13, 0)).build();
        hall = Hall.builder().id(1L).hallNumber("LH-101").building("Science").floor(1).capacity(30).build();
        student1 = Student.builder().id(101L).registerNumber("21CS001").name("Alice").branch("CSE").year(3).section("A").build();
        seat1 = Seat.builder().id(1L).hall(hall).seatNumber("R1-C1").rowNumber(1).columnNumber(1).build();
    }

    @Test
    @DisplayName("Should retrieve hall attendance with calculated metrics")
    void shouldGetHallAttendance() {
        SeatingArrangement sa = SeatingArrangement.builder().id(1L).exam(exam).hall(hall).student(student1).seat(seat1).build();
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(hallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(seatingArrangementRepository.findArrangementDetailsByExamAndHall(1L, 1L)).thenReturn(List.of(sa));
        when(attendanceRepository.findByExamIdAndHallId(1L, 1L)).thenReturn(Collections.emptyList());

        HallAttendanceResponse res = attendanceService.getHallAttendance(1L, 1L);

        assertNotNull(res);
        assertEquals(1, res.getTotalStudents());
        assertEquals(1, res.getPresentCount()); // Defaults to PRESENT
        assertEquals(100.0, res.getAttendancePercentage());
        assertEquals("LH-101", res.getHallNumber());
        assertEquals("Java Programming", res.getExamName());
    }

    @Test
    @DisplayName("Should save bulk attendance records")
    void shouldSaveBulkAttendance() {
        SaveAttendanceRequest req = SaveAttendanceRequest.builder()
                .examId(1L)
                .hallId(1L)
                .records(List.of(
                        new SaveAttendanceRequest.StudentStatusEntry(101L, AttendanceStatus.ABSENT)
                ))
                .build();

        SeatingArrangement sa = SeatingArrangement.builder().id(1L).exam(exam).hall(hall).student(student1).seat(seat1).build();
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(hallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(studentRepository.findById(101L)).thenReturn(Optional.of(student1));
        when(attendanceRepository.findByExamIdAndStudentId(1L, 101L)).thenReturn(Optional.empty());
        when(seatingArrangementRepository.findArrangementDetailsByExamAndHall(1L, 1L)).thenReturn(List.of(sa));

        Attendance savedAtt = Attendance.builder().id(10L).exam(exam).student(student1).hall(hall).status(AttendanceStatus.ABSENT).build();
        when(attendanceRepository.findByExamIdAndHallId(1L, 1L)).thenReturn(List.of(savedAtt));

        HallAttendanceResponse res = attendanceService.saveAttendance(req);

        verify(attendanceRepository, times(1)).save(any(Attendance.class));
        assertNotNull(res);
        assertEquals(1, res.getAbsentCount());
        assertEquals(0, res.getPresentCount());
        assertEquals(0.0, res.getAttendancePercentage());
    }

    @Test
    @DisplayName("Should update individual attendance status")
    void shouldUpdateIndividualStatus() {
        Attendance att = Attendance.builder().id(5L).exam(exam).student(student1).hall(hall).status(AttendanceStatus.PRESENT).build();
        when(attendanceRepository.findById(5L)).thenReturn(Optional.of(att));
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(att);

        AttendanceStudentDto dto = attendanceService.updateAttendanceStatus(5L, AttendanceStatus.ABSENT);

        assertNotNull(dto);
        assertEquals(AttendanceStatus.ABSENT, dto.getStatus());
        assertEquals("21CS001", dto.getRegisterNumber());
    }
}
