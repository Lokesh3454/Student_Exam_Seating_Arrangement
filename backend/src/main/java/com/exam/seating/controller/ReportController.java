package com.exam.seating.controller;

import com.exam.seating.dto.AttendanceReportResponse;
import com.exam.seating.dto.ExamWiseReportResponse;
import com.exam.seating.dto.HallWiseReportResponse;
import com.exam.seating.dto.StudentWiseReportResponse;
import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final com.exam.seating.service.PdfReportService pdfReportService;

    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<ApiResponse<com.exam.seating.dto.response.DashboardStatsResponseDto>> getDashboardStats() {
        log.info("REST: Fetching Dashboard Key Metrics & Statistics");
        com.exam.seating.dto.response.DashboardStatsResponseDto stats = reportService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/export/pdf/exam-seating/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<byte[]> exportExamSeatingPdf(@PathVariable Long examId) {
        log.info("REST: Exporting Exam Seating PDF for Exam ID {}", examId);
        byte[] pdf = pdfReportService.generateExamSeatingPdf(examId);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.inline()
                .filename("exam-seating-arrangement-" + examId + ".pdf").build());
        return new ResponseEntity<>(pdf, headers, org.springframework.http.HttpStatus.OK);
    }

    @GetMapping("/export/pdf/hall-chart/{hallId}/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<byte[]> exportHallChartPdf(@PathVariable Long hallId, @PathVariable Long examId) {
        log.info("REST: Exporting Hall Seating Chart PDF for Hall {} Exam {}", hallId, examId);
        byte[] pdf = pdfReportService.generateHallSeatingChartPdf(hallId, examId);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.inline()
                .filename("hall-seating-chart-" + hallId + "-exam-" + examId + ".pdf").build());
        return new ResponseEntity<>(pdf, headers, org.springframework.http.HttpStatus.OK);
    }

    @GetMapping("/export/pdf/student-report")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<byte[]> exportStudentReportPdf(
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) String keyword) {
        log.info("REST: Exporting Student-wise Seating PDF for Exam {}", examId);
        byte[] pdf = pdfReportService.generateStudentWiseReportPdf(examId, keyword);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.inline()
                .filename("student-seating-report-" + (examId != null ? examId : "all") + ".pdf").build());
        return new ResponseEntity<>(pdf, headers, org.springframework.http.HttpStatus.OK);
    }

    @GetMapping("/export/pdf/attendance/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<byte[]> exportAttendanceReportPdf(
            @PathVariable Long examId,
            @RequestParam(required = false) Long hallId) {
        log.info("REST: Exporting Attendance Register PDF for Exam {}, Hall {}", examId, hallId);
        byte[] pdf = pdfReportService.generateAttendanceRosterPdf(examId, hallId);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.inline()
                .filename("attendance-register-exam-" + examId + (hallId != null ? "-hall-" + hallId : "") + ".pdf").build());
        return new ResponseEntity<>(pdf, headers, org.springframework.http.HttpStatus.OK);
    }

    @GetMapping("/export/pdf/admit-card/{examId}/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT', 'HOD')")
    public ResponseEntity<byte[]> exportAdmitCardPdf(
            @PathVariable Long examId,
            @PathVariable Long studentId) {
        log.info("REST: Exporting Student Admit Card PDF for Exam ID {} and Student ID {}", examId, studentId);
        byte[] pdf = pdfReportService.generateAdmitCardPdf(examId, studentId);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.inline()
                .filename("admit-card-student-" + studentId + "-exam-" + examId + ".pdf").build());
        return new ResponseEntity<>(pdf, headers, org.springframework.http.HttpStatus.OK);
    }

    @GetMapping("/exam-wise")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<ApiResponse<List<ExamWiseReportResponse>>> getExamWiseReport() {
        log.info("REST: Generating Exam-wise seating & attendance report");
        List<ExamWiseReportResponse> report = reportService.getExamWiseReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/hall-wise")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<ApiResponse<List<HallWiseReportResponse>>> getHallWiseReport(
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) Long hallId) {

        log.info("REST: Generating Hall-wise report for exam: {}, hall: {}", examId, hallId);
        List<HallWiseReportResponse> report = reportService.getHallWiseReport(examId, hallId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/student-wise")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<ApiResponse<List<StudentWiseReportResponse>>> getStudentWiseReport(
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) String keyword) {

        log.info("REST: Generating Student-wise report for exam: {}, keyword: {}", examId, keyword);
        List<StudentWiseReportResponse> report = reportService.getStudentWiseReport(examId, keyword);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<ApiResponse<List<AttendanceReportResponse>>> getAttendanceReport(
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        log.info("REST: Generating Attendance report for exam: {}, date: {}", examId, date);
        List<AttendanceReportResponse> report = reportService.getAttendanceReport(examId, date);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
