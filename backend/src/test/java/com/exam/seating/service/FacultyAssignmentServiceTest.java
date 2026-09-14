package com.exam.seating.service;

import com.exam.seating.dto.FacultyAssignmentRequest;
import com.exam.seating.dto.FacultyAssignmentResponse;
import com.exam.seating.entity.Exam;
import com.exam.seating.entity.Faculty;
import com.exam.seating.entity.FacultyAssignment;
import com.exam.seating.entity.Hall;
import com.exam.seating.exception.BadRequestException;
import com.exam.seating.exception.DuplicateResourceException;
import com.exam.seating.repository.*;
import com.exam.seating.service.impl.FacultyAssignmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyAssignmentServiceTest {

    @Mock
    private FacultyAssignmentRepository assignmentRepository;
    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private ExamRepository examRepository;
    @Mock
    private HallRepository hallRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SeatingArrangementRepository seatingArrangementRepository;

    @InjectMocks
    private FacultyAssignmentServiceImpl assignmentService;

    private Faculty faculty;
    private Exam exam;
    private Hall hall;

    @BeforeEach
    void setUp() {
        faculty = Faculty.builder().id(10L).employeeId("FAC-1001").name("Dr. Alex").email("alex@uni.edu").phone("9876543210").build();
        exam = Exam.builder().id(1L).examName("Operating Systems").subject("CS301").examDate(LocalDate.now()).startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(13, 0)).build();
        hall = Hall.builder().id(2L).hallNumber("LH-201").building("Block A").capacity(50).build();
    }

    @Test
    @DisplayName("Should successfully assign faculty to hall")
    void shouldAssignFacultySuccessfully() {
        FacultyAssignmentRequest req = new FacultyAssignmentRequest(10L, 1L, 2L);

        when(facultyRepository.findById(10L)).thenReturn(Optional.of(faculty));
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(hallRepository.findById(2L)).thenReturn(Optional.of(hall));
        when(assignmentRepository.existsByExamIdAndHallIdAndFacultyId(1L, 2L, 10L)).thenReturn(false);
        when(assignmentRepository.existsByExamIdAndFacultyIdAndHallIdNot(1L, 10L, 2L)).thenReturn(false);

        FacultyAssignment saved = FacultyAssignment.builder().id(100L).faculty(faculty).exam(exam).hall(hall).build();
        when(assignmentRepository.save(any(FacultyAssignment.class))).thenReturn(saved);
        when(seatingArrangementRepository.countByExamIdAndHallId(1L, 2L)).thenReturn(25L);

        FacultyAssignmentResponse res = assignmentService.assignFacultyToHall(req);

        assertNotNull(res);
        assertEquals("Dr. Alex", res.getFacultyName());
        assertEquals("LH-201", res.getHallNumber());
        assertEquals(25, res.getAssignedStudentsCount());
    }

    @Test
    @DisplayName("Should prevent duplicate duty assignment for same hall and exam")
    void shouldPreventDuplicateAssignment() {
        FacultyAssignmentRequest req = new FacultyAssignmentRequest(10L, 1L, 2L);

        when(facultyRepository.findById(10L)).thenReturn(Optional.of(faculty));
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(hallRepository.findById(2L)).thenReturn(Optional.of(hall));
        when(assignmentRepository.existsByExamIdAndHallIdAndFacultyId(1L, 2L, 10L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> assignmentService.assignFacultyToHall(req));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should prevent scheduling conflict if faculty already in another hall for same exam")
    void shouldPreventScheduleConflict() {
        FacultyAssignmentRequest req = new FacultyAssignmentRequest(10L, 1L, 2L);

        when(facultyRepository.findById(10L)).thenReturn(Optional.of(faculty));
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(hallRepository.findById(2L)).thenReturn(Optional.of(hall));
        when(assignmentRepository.existsByExamIdAndHallIdAndFacultyId(1L, 2L, 10L)).thenReturn(false);
        when(assignmentRepository.existsByExamIdAndFacultyIdAndHallIdNot(1L, 10L, 2L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> assignmentService.assignFacultyToHall(req));
        verify(assignmentRepository, never()).save(any());
    }
}
