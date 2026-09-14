package com.exam.seating.service;

import com.exam.seating.dto.request.GenerateSeatingRequestDto;
import com.exam.seating.dto.response.SeatingGenerationResponseDto;
import com.exam.seating.dto.response.StudentSeatSearchResponseDto;
import com.exam.seating.entity.*;
import com.exam.seating.entity.enums.ExamStatus;
import com.exam.seating.entity.enums.SeatStatus;
import com.exam.seating.entity.enums.SeatingStrategy;
import com.exam.seating.exception.BadRequestException;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.*;
import com.exam.seating.service.impl.SeatingArrangementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
class SeatingArrangementServiceTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ExamStudentRepository examStudentRepository;

    @Mock
    private HallRepository hallRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private SeatingArrangementRepository seatingArrangementRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @InjectMocks
    private SeatingArrangementServiceImpl seatingArrangementService;

    private Exam testExam;
    private Hall testHall1;
    private Hall testHall2;

    @BeforeEach
    void setUp() {
        testExam = Exam.builder()
                .id(1L)
                .examName("Data Structures Examination")
                .subject("Computer Science")
                .examDate(LocalDate.now().plusDays(5))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(13, 0))
                .status(ExamStatus.SCHEDULED)
                .build();

        testHall1 = Hall.builder()
                .id(1L)
                .hallNumber("LH-101")
                .building("Main Block")
                .floor(1)
                .rowsCount(4)
                .columnsCount(5)
                .capacity(20)
                .build();

        testHall2 = Hall.builder()
                .id(2L)
                .hallNumber("LH-102")
                .building("Main Block")
                .floor(1)
                .rowsCount(2)
                .columnsCount(5)
                .capacity(10)
                .build();
    }

    private List<Student> createStudents(int count, String branch) {
        List<Student> list = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            list.add(Student.builder()
                    .id((long) i)
                    .registerNumber(String.format("%s%03d", branch, i))
                    .name("Student " + i)
                    .branch(branch)
                    .year(3)
                    .section("A")
                    .email(String.format("s%d@test.edu", i))
                    .phone("9876543210")
                    .build());
        }
        return list;
    }

    private List<ExamStudent> createExamStudents(Exam exam, List<Student> students) {
        List<ExamStudent> list = new ArrayList<>();
        long id = 1;
        for (Student s : students) {
            list.add(new ExamStudent(id++, exam, s));
        }
        return list;
    }

    private List<Seat> createSeats(Hall hall, int count) {
        List<Seat> list = new ArrayList<>();
        int row = 1;
        int col = 1;
        for (int i = 1; i <= count; i++) {
            list.add(Seat.builder()
                    .id((long) (hall.getId() * 100 + i))
                    .hall(hall)
                    .rowNumber(row)
                    .columnNumber(col)
                    .seatNumber(String.format("R%d-C%d", row, col))
                    .status(SeatStatus.AVAILABLE)
                    .build());
            col++;
            if (col > hall.getColumnsCount()) {
                col = 1;
                row++;
            }
        }
        return list;
    }

    // -------------------------------------------------------------------------
    // Test Case 1: 10 students / 20 seats
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Test 1: 10 students allocated to 20 available seats (Success)")
    void test1_tenStudentsTwentySeats_Success() {
        List<Student> students = createStudents(10, "CSE");
        List<ExamStudent> examStudents = createExamStudents(testExam, students);
        List<Seat> seats = createSeats(testHall1, 20);

        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));
        when(seatingArrangementRepository.countByExamId(1L)).thenReturn(0L);
        when(examStudentRepository.findByExamIdWithStudent(1L)).thenReturn(examStudents);
        when(hallRepository.findAll()).thenReturn(List.of(testHall1));
        when(seatRepository.findByStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(SeatStatus.AVAILABLE)).thenReturn(seats);

        GenerateSeatingRequestDto request = GenerateSeatingRequestDto.builder()
                .strategy(SeatingStrategy.SEQUENTIAL)
                .build();

        SeatingGenerationResponseDto response = seatingArrangementService.generateSeatingArrangement(1L, request);

        assertNotNull(response);
        assertEquals(10, response.getTotalStudents());
        assertEquals(10, response.getTotalSeatsUsed());
        assertEquals(1, response.getHallsUsed());
        verify(seatingArrangementRepository, times(1)).saveAll(any());
    }

    // -------------------------------------------------------------------------
    // Test Case 2: 20 students / 20 seats
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Test 2: 20 students allocated to exact 20 seats (Full capacity success)")
    void test2_twentyStudentsTwentySeats_Success() {
        List<Student> students = createStudents(20, "CSE");
        List<ExamStudent> examStudents = createExamStudents(testExam, students);
        List<Seat> seats = createSeats(testHall1, 20);

        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));
        when(seatingArrangementRepository.countByExamId(1L)).thenReturn(0L);
        when(examStudentRepository.findByExamIdWithStudent(1L)).thenReturn(examStudents);
        when(hallRepository.findAll()).thenReturn(List.of(testHall1));
        when(seatRepository.findByStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(SeatStatus.AVAILABLE)).thenReturn(seats);

        SeatingGenerationResponseDto response = seatingArrangementService.generateSeatingArrangement(1L, null);

        assertEquals(20, response.getTotalStudents());
        assertEquals(20, response.getTotalSeatsUsed());
    }

    // -------------------------------------------------------------------------
    // Test Case 3: 25 students / 20 seats (Capacity Rejection)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Test 3: 25 students with 20 seats rejects with exact error message")
    void test3_twentyFiveStudentsTwentySeats_ThrowsException() {
        List<Student> students = createStudents(25, "CSE");
        List<ExamStudent> examStudents = createExamStudents(testExam, students);
        List<Seat> seats = createSeats(testHall1, 20);

        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));
        when(seatingArrangementRepository.countByExamId(1L)).thenReturn(0L);
        when(examStudentRepository.findByExamIdWithStudent(1L)).thenReturn(examStudents);
        when(hallRepository.findAll()).thenReturn(List.of(testHall1));
        when(seatRepository.findByStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(SeatStatus.AVAILABLE)).thenReturn(seats);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                seatingArrangementService.generateSeatingArrangement(1L, null));

        assertEquals("Not enough seats available. Required: 25, Available: 20.", ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // Test Case 4: Multiple Halls
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Test 4: Allocation spans across multiple halls")
    void test4_multipleHalls_Success() {
        List<Student> students = createStudents(25, "CSE");
        List<ExamStudent> examStudents = createExamStudents(testExam, students);

        List<Seat> hall1Seats = createSeats(testHall1, 20);
        List<Seat> hall2Seats = createSeats(testHall2, 10);
        List<Seat> allSeats = new ArrayList<>(hall1Seats);
        allSeats.addAll(hall2Seats);

        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));
        when(seatingArrangementRepository.countByExamId(1L)).thenReturn(0L);
        when(examStudentRepository.findByExamIdWithStudent(1L)).thenReturn(examStudents);
        when(hallRepository.findAll()).thenReturn(List.of(testHall1, testHall2));
        when(seatRepository.findByStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(SeatStatus.AVAILABLE)).thenReturn(allSeats);

        SeatingGenerationResponseDto response = seatingArrangementService.generateSeatingArrangement(1L, null);

        assertEquals(25, response.getTotalStudents());
        assertEquals(2, response.getHallsUsed());
    }

    // -------------------------------------------------------------------------
    // Test Case 5: Multiple Branches (Branch Alternation)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Test 5: BRANCH_ALTERNATION interleaves students across branches")
    @SuppressWarnings("unchecked")
    void test5_multipleBranches_AlternationSuccess() {
        List<Student> cseStudents = createStudents(3, "CSE");
        List<Student> eceStudents = createStudents(3, "ECE");
        List<Student> allStudents = new ArrayList<>(cseStudents);
        allStudents.addAll(eceStudents);

        List<ExamStudent> examStudents = createExamStudents(testExam, allStudents);
        List<Seat> seats = createSeats(testHall1, 10);

        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));
        when(seatingArrangementRepository.countByExamId(1L)).thenReturn(0L);
        when(examStudentRepository.findByExamIdWithStudent(1L)).thenReturn(examStudents);
        when(hallRepository.findAll()).thenReturn(List.of(testHall1));
        when(seatRepository.findByStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(SeatStatus.AVAILABLE)).thenReturn(seats);

        GenerateSeatingRequestDto request = GenerateSeatingRequestDto.builder()
                .strategy(SeatingStrategy.BRANCH_ALTERNATION)
                .build();

        seatingArrangementService.generateSeatingArrangement(1L, request);

        ArgumentCaptor<List<SeatingArrangement>> captor = ArgumentCaptor.forClass(List.class);
        verify(seatingArrangementRepository).saveAll(captor.capture());
        List<SeatingArrangement> saved = captor.getValue();

        assertEquals(6, saved.size());
        // Verify alternating branch order: CSE, ECE, CSE, ECE, CSE, ECE
        assertEquals("CSE", saved.get(0).getStudent().getBranch());
        assertEquals("ECE", saved.get(1).getStudent().getBranch());
        assertEquals("CSE", saved.get(2).getStudent().getBranch());
        assertEquals("ECE", saved.get(3).getStudent().getBranch());
        assertEquals("CSE", saved.get(4).getStudent().getBranch());
        assertEquals("ECE", saved.get(5).getStudent().getBranch());
    }

    // -------------------------------------------------------------------------
    // Test Case 6: Duplicate Generation (Should be rejected)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Test 6: Duplicate generation attempt throws BadRequestException")
    void test6_duplicateGeneration_ThrowsException() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));
        when(seatingArrangementRepository.countByExamId(1L)).thenReturn(10L);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                seatingArrangementService.generateSeatingArrangement(1L, null));

        assertTrue(ex.getMessage().contains("already exists"));
    }

    // -------------------------------------------------------------------------
    // Test Case 7: Missing Exam (Should return 404)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Test 7: Missing Exam ID throws ResourceNotFoundException")
    void test7_missingExam_ThrowsException() {
        when(examRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                seatingArrangementService.generateSeatingArrangement(999L, null));
    }

    // -------------------------------------------------------------------------
    // Test Case 8: No Students Registered
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Test 8: Exam with zero eligible students throws BadRequestException")
    void test8_noStudents_ThrowsException() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));
        when(seatingArrangementRepository.countByExamId(1L)).thenReturn(0L);
        when(examStudentRepository.findByExamIdWithStudent(1L)).thenReturn(Collections.emptyList());

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                seatingArrangementService.generateSeatingArrangement(1L, null));

        assertEquals("No eligible students registered for this exam.", ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // Test Case 9: No Examination Halls
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Test 9: No examination halls available throws BadRequestException")
    void test9_noHalls_ThrowsException() {
        List<Student> students = createStudents(5, "CSE");
        List<ExamStudent> examStudents = createExamStudents(testExam, students);

        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));
        when(seatingArrangementRepository.countByExamId(1L)).thenReturn(0L);
        when(examStudentRepository.findByExamIdWithStudent(1L)).thenReturn(examStudents);
        when(hallRepository.findAll()).thenReturn(Collections.emptyList());

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                seatingArrangementService.generateSeatingArrangement(1L, null));

        assertEquals("No examination halls available for seating arrangement.", ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // Test Case 10: No Available Seats (All in maintenance or absent)
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Test 10: Zero available seats throws BadRequestException")
    void test10_noAvailableSeats_ThrowsException() {
        List<Student> students = createStudents(5, "CSE");
        List<ExamStudent> examStudents = createExamStudents(testExam, students);

        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));
        when(seatingArrangementRepository.countByExamId(1L)).thenReturn(0L);
        when(examStudentRepository.findByExamIdWithStudent(1L)).thenReturn(examStudents);
        when(hallRepository.findAll()).thenReturn(List.of(testHall1));
        when(seatRepository.findByStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(SeatStatus.AVAILABLE))
                .thenReturn(Collections.emptyList());

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                seatingArrangementService.generateSeatingArrangement(1L, null));

        assertEquals("No available seats in the selected examination halls.", ex.getMessage());
    }
}
