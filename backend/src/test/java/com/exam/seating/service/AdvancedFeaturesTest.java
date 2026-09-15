package com.exam.seating.service;

import com.exam.seating.dto.request.GenerateSeatingRequestDto;
import com.exam.seating.dto.response.ConflictCheckResponseDto;
import com.exam.seating.dto.response.SeatingGenerationResponseDto;
import com.exam.seating.dto.response.StudentImportSummaryDto;
import com.exam.seating.entity.*;
import com.exam.seating.entity.enums.ExamStatus;
import com.exam.seating.entity.enums.SeatStatus;
import com.exam.seating.entity.enums.SeatingStrategy;
import com.exam.seating.repository.*;
import com.exam.seating.service.impl.PdfReportServiceImpl;
import com.exam.seating.service.impl.SeatingArrangementServiceImpl;
import com.exam.seating.service.impl.StudentServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdvancedFeaturesTest {

    @Mock
    private StudentRepository studentRepository;

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

    @Mock
    private FacultyAssignmentRepository facultyAssignmentRepository;

    @InjectMocks
    private StudentServiceImpl studentService;

    @InjectMocks
    private SeatingArrangementServiceImpl seatingArrangementService;

    @InjectMocks
    private PdfReportServiceImpl pdfReportService;

    @Test
    @DisplayName("1. CSV Import: Successfully import valid rows and reject invalid/duplicate rows")
    void testStudentCsvImport() {
        String csvContent = "registerNumber,name,branch,year,section,email,phone\n" +
                "REG101,Alice Smith,CSE,3,A,alice@test.com,9876543210\n" +
                "REG102,Bob Jones,ECE,2,B,bob@test.com,9876543211\n" +
                "REG101,Alice Duplicate,CSE,3,A,alice_dup@test.com,9876543212\n" + // duplicate reg in file
                "REG103,Charlie BadYear,MECH,5,A,charlie@test.com,9876543213\n" + // invalid year
                "REG104,David BadEmail,CIVIL,1,A,invalid-email,9876543214\n" + // invalid email
                ",Missing Reg,CSE,2,A,missing@test.com,9876543215\n"; // missing reg

        MockMultipartFile file = new MockMultipartFile(
                "file", "students.csv", "text/csv", csvContent.getBytes(StandardCharsets.UTF_8));

        when(studentRepository.existsByRegisterNumber("REG101")).thenReturn(false);
        when(studentRepository.existsByRegisterNumber("REG102")).thenReturn(false);
        when(studentRepository.existsByEmail("alice@test.com")).thenReturn(false);
        when(studentRepository.existsByEmail("bob@test.com")).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArgument(0));

        StudentImportSummaryDto summary = studentService.importStudentsFromCsv(file);

        assertNotNull(summary);
        assertEquals(6, summary.getTotalRows());
        assertEquals(2, summary.getSuccessfullyImported());
        assertEquals(1, summary.getDuplicateRows()); // REG101 second time
        assertEquals(3, summary.getFailedRows()); // BadYear, BadEmail, MissingReg
        assertEquals(4, summary.getErrors().size());
    }

    @Test
    @DisplayName("2. Conflict Detection: Detect insufficient seats, invalid exam, and existing seating")
    void testConflictDetection() {
        Exam exam = Exam.builder()
                .id(10L)
                .examName("Algorithms")
                .subject("CS301")
                .examDate(LocalDate.now().plusDays(5))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(12, 0))
                .status(ExamStatus.SCHEDULED)
                .build();

        Student s1 = Student.builder().id(1L).registerNumber("R1").branch("CSE").build();
        Student s2 = Student.builder().id(2L).registerNumber("R2").branch("ECE").build();
        Student s3 = Student.builder().id(3L).registerNumber("R3").branch("MECH").build();

        List<ExamStudent> enrolled = List.of(
                ExamStudent.builder().id(1L).exam(exam).student(s1).build(),
                ExamStudent.builder().id(2L).exam(exam).student(s2).build(),
                ExamStudent.builder().id(3L).exam(exam).student(s3).build()
        );

        Hall hall = Hall.builder().id(1L).hallNumber("H101").capacity(2).build();
        Seat seat1 = Seat.builder().id(1L).hall(hall).rowNumber(1).columnNumber(1).seatNumber("H101-R1C1").status(SeatStatus.AVAILABLE).build();
        Seat seat2 = Seat.builder().id(2L).hall(hall).rowNumber(1).columnNumber(2).seatNumber("H101-R1C2").status(SeatStatus.AVAILABLE).build();

        when(examRepository.findById(10L)).thenReturn(Optional.of(exam));
        when(examStudentRepository.findByExamIdWithStudent(10L)).thenReturn(enrolled);
        when(hallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(seatRepository.countByHallIdAndStatus(1L, SeatStatus.AVAILABLE)).thenReturn(2L);
        when(seatRepository.findByHallIdInAndStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(List.of(1L), SeatStatus.AVAILABLE))
                .thenReturn(List.of(seat1, seat2));
        when(seatingArrangementRepository.countByExamId(10L)).thenReturn(2L);

        ConflictCheckResponseDto report = seatingArrangementService.validateConflicts(10L, List.of(1L));

        assertNotNull(report);
        assertTrue(report.isHasConflicts());
        assertEquals(3, report.getEligibleStudentCount());
        assertEquals(2, report.getTotalAvailableSeats());
        assertEquals(1, report.getDeficitSeats());
        assertTrue(report.isAlreadyGenerated());

        boolean hasInsufficientSeats = report.getConflicts().stream()
                .anyMatch(c -> "INSUFFICIENT_SEATS".equals(c.getType()) && "ERROR".equals(c.getSeverity()));
        assertTrue(hasInsufficientSeats);

        boolean hasAlreadyAssigned = report.getConflicts().stream()
                .anyMatch(c -> "ALREADY_ASSIGNED".equals(c.getType()) && "WARNING".equals(c.getSeverity()));
        assertTrue(hasAlreadyAssigned);
    }

    @Test
    @DisplayName("3. Seating Rule: ADJACENT_BRANCH_SEPARATION separates candidates of same branch in adjacent desks")
    void testAdjacentBranchSeparation() {
        Exam exam = Exam.builder()
                .id(20L)
                .examName("Networks")
                .subject("CS401")
                .examDate(LocalDate.now().plusDays(2))
                .build();

        Student cse1 = Student.builder().id(1L).registerNumber("CSE01").name("CSE Student 1").branch("CSE").build();
        Student cse2 = Student.builder().id(2L).registerNumber("CSE02").name("CSE Student 2").branch("CSE").build();
        Student ece1 = Student.builder().id(3L).registerNumber("ECE01").name("ECE Student 1").branch("ECE").build();
        Student ece2 = Student.builder().id(4L).registerNumber("ECE02").name("ECE Student 2").branch("ECE").build();

        List<ExamStudent> enrolled = List.of(
                ExamStudent.builder().exam(exam).student(cse1).build(),
                ExamStudent.builder().exam(exam).student(cse2).build(),
                ExamStudent.builder().exam(exam).student(ece1).build(),
                ExamStudent.builder().exam(exam).student(ece2).build()
        );

        Hall hall = Hall.builder().id(100L).hallNumber("H200").capacity(4).build();
        // 4 contiguous seats in Row 1: Col 1, Col 2, Col 3, Col 4
        List<Seat> seats = List.of(
                Seat.builder().id(1L).hall(hall).rowNumber(1).columnNumber(1).seatNumber("H200-R1C1").status(SeatStatus.AVAILABLE).build(),
                Seat.builder().id(2L).hall(hall).rowNumber(1).columnNumber(2).seatNumber("H200-R1C2").status(SeatStatus.AVAILABLE).build(),
                Seat.builder().id(3L).hall(hall).rowNumber(1).columnNumber(3).seatNumber("H200-R1C3").status(SeatStatus.AVAILABLE).build(),
                Seat.builder().id(4L).hall(hall).rowNumber(1).columnNumber(4).seatNumber("H200-R1C4").status(SeatStatus.AVAILABLE).build()
        );

        when(examRepository.findById(20L)).thenReturn(Optional.of(exam));
        when(seatingArrangementRepository.countByExamId(20L)).thenReturn(0L);
        when(examStudentRepository.findByExamIdWithStudent(20L)).thenReturn(enrolled);
        when(seatRepository.findByStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(SeatStatus.AVAILABLE)).thenReturn(seats);
        when(hallRepository.findAll()).thenReturn(List.of(hall));

        // Save mock captor
        List<SeatingArrangement> saved = new ArrayList<>();
        when(seatingArrangementRepository.saveAll(any())).thenAnswer(i -> {
            List<SeatingArrangement> list = i.getArgument(0);
            saved.addAll(list);
            return list;
        });

        GenerateSeatingRequestDto request = GenerateSeatingRequestDto.builder()
                .strategy(SeatingStrategy.ADJACENT_BRANCH_SEPARATION)
                .build();

        SeatingGenerationResponseDto resp = seatingArrangementService.generateSeatingArrangement(20L, request);

        assertNotNull(resp);
        assertEquals(4, saved.size());

        // Check that adjacent seats do NOT have the same branch
        for (int i = 0; i < saved.size() - 1; i++) {
            Seat sCurr = saved.get(i).getSeat();
            Seat sNext = saved.get(i + 1).getSeat();
            if (sCurr.getRowNumber().equals(sNext.getRowNumber()) && sNext.getColumnNumber() == sCurr.getColumnNumber() + 1) {
                String branchCurr = saved.get(i).getStudent().getBranch();
                String branchNext = saved.get(i + 1).getStudent().getBranch();
                assertNotEquals(branchCurr, branchNext, "Adjacent desks in the same row must have different branches!");
            }
        }
    }

    @Test
    @DisplayName("4. PDF Generation: Generate valid PDF byte streams with %PDF magic header")
    void testPdfGeneration() {
        Exam exam = Exam.builder()
                .id(1L)
                .examName("Operating Systems")
                .subject("CS501")
                .examDate(LocalDate.now())
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(13, 0))
                .status(ExamStatus.SCHEDULED)
                .build();

        Hall hall = Hall.builder().id(1L).hallNumber("H101").building("Main Block").floor(1).capacity(30).build();
        Student student = Student.builder().id(1L).registerNumber("REG001").name("John Doe").branch("CSE").year(3).section("A").build();
        Seat seat = Seat.builder().id(1L).hall(hall).seatNumber("H101-R1C1").rowNumber(1).columnNumber(1).build();

        SeatingArrangement sa = SeatingArrangement.builder()
                .id(1L)
                .exam(exam)
                .hall(hall)
                .seat(seat)
                .student(student)
                .build();

        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(hallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(seatingArrangementRepository.findFullArrangementByExamId(1L)).thenReturn(List.of(sa));
        when(seatingArrangementRepository.findArrangementDetailsByExamAndHall(1L, 1L)).thenReturn(List.of(sa));
        when(seatingArrangementRepository.findAll()).thenReturn(List.of(sa));

        // 1. Exam Seating PDF
        byte[] examPdf = pdfReportService.generateExamSeatingPdf(1L);
        assertNotNull(examPdf);
        assertTrue(examPdf.length > 500);
        assertEquals('%', (char) examPdf[0]);
        assertEquals('P', (char) examPdf[1]);
        assertEquals('D', (char) examPdf[2]);
        assertEquals('F', (char) examPdf[3]);

        // 2. Hall Chart PDF
        byte[] hallPdf = pdfReportService.generateHallSeatingChartPdf(1L, 1L);
        assertNotNull(hallPdf);
        assertTrue(hallPdf.length > 500);
        assertEquals('%', (char) hallPdf[0]);

        // 3. Student Wise Report PDF (with and without examId)
        byte[] studentPdf = pdfReportService.generateStudentWiseReportPdf(1L, null);
        assertNotNull(studentPdf);
        assertTrue(studentPdf.length > 500);
        assertEquals('%', (char) studentPdf[0]);

        byte[] allStudentPdf = pdfReportService.generateStudentWiseReportPdf(null, null);
        assertNotNull(allStudentPdf);
        assertTrue(allStudentPdf.length > 500);

        // 4. Attendance Register PDF
        byte[] attPdf = pdfReportService.generateAttendanceRosterPdf(1L, 1L);
        assertNotNull(attPdf);
        assertTrue(attPdf.length > 500);
        assertEquals('%', (char) attPdf[0]);
    }
}
