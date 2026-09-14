package com.exam.seating.controller;

import com.exam.seating.dto.request.AssignStudentsRequestDto;
import com.exam.seating.dto.request.ExamRequestDto;
import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.dto.response.ExamResponseDto;
import com.exam.seating.dto.response.StudentResponseDto;
import com.exam.seating.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamResponseDto>>> getAllExams() {
        List<ExamResponseDto> exams = examService.getAllExams();
        return ResponseEntity.ok(ApiResponse.success("Exams retrieved successfully", exams));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamResponseDto>> getExamById(@PathVariable Long id) {
        ExamResponseDto exam = examService.getExamById(id);
        return ResponseEntity.ok(ApiResponse.success("Exam retrieved successfully", exam));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExamResponseDto>> createExam(
            @Valid @RequestBody ExamRequestDto dto) {
        ExamResponseDto created = examService.createExam(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Exam scheduled successfully", created),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamResponseDto>> updateExam(
            @PathVariable Long id,
            @Valid @RequestBody ExamRequestDto dto) {
        ExamResponseDto updated = examService.updateExam(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully", null));
    }

    @PostMapping("/{examId}/students")
    public ResponseEntity<ApiResponse<List<StudentResponseDto>>> assignStudentsToExam(
            @PathVariable Long examId,
            @Valid @RequestBody AssignStudentsRequestDto dto) {
        List<StudentResponseDto> assigned = examService.assignStudentsToExam(examId, dto);
        return new ResponseEntity<>(
                ApiResponse.success("Students assigned to exam successfully", assigned),
                HttpStatus.CREATED
        );
    }

    @DeleteMapping("/{examId}/students/{studentId}")
    public ResponseEntity<ApiResponse<Void>> removeStudentFromExam(
            @PathVariable Long examId,
            @PathVariable Long studentId) {
        examService.removeStudentFromExam(examId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Student removed from exam successfully", null));
    }

    @GetMapping("/{examId}/students")
    public ResponseEntity<ApiResponse<List<StudentResponseDto>>> getStudentsByExamId(
            @PathVariable Long examId) {
        List<StudentResponseDto> students = examService.getStudentsByExamId(examId);
        return ResponseEntity.ok(ApiResponse.success("Assigned students retrieved successfully", students));
    }

    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<com.exam.seating.dto.response.ExamImportSummaryDto>> importExamsFromCsv(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        com.exam.seating.dto.response.ExamImportSummaryDto summary = examService.importExamsFromCsv(file);
        return ResponseEntity.ok(ApiResponse.success("Exam schedule CSV processing completed", summary));
    }

    @GetMapping("/branch/{branch}")
    public ResponseEntity<ApiResponse<List<ExamResponseDto>>> getExamsByBranch(@PathVariable String branch) {
        List<ExamResponseDto> exams = examService.getExamsByBranch(branch);
        return ResponseEntity.ok(ApiResponse.success("Exams retrieved for branch: " + branch, exams));
    }

    @PutMapping("/{id}/allotted-halls")
    public ResponseEntity<ApiResponse<ExamResponseDto>> updateAllottedHalls(
            @PathVariable Long id,
            @RequestBody List<Long> hallIds) {
        ExamResponseDto updated = examService.updateAllottedHalls(id, hallIds);
        return ResponseEntity.ok(ApiResponse.success("Allotted examination halls updated successfully", updated));
    }

    @PostMapping("/{id}/students/auto-enroll-branch")
    public ResponseEntity<ApiResponse<List<StudentResponseDto>>> autoEnrollStudentsByBranch(
            @PathVariable Long id) {
        List<StudentResponseDto> enrolled = examService.autoEnrollStudentsByBranch(id);
        return ResponseEntity.ok(ApiResponse.success("Eligible branch students enrolled successfully", enrolled));
    }

    @GetMapping(value = "/csv-template", produces = "text/csv")
    public ResponseEntity<String> getExamCsvTemplate() {
        String csv = examService.getExamCsvTemplate();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=exams_schedule_template.csv")
                .body(csv);
    }

    @GetMapping("/concurrent-sessions")
    public ResponseEntity<ApiResponse<List<com.exam.seating.dto.response.ConcurrentExamSessionDto>>> getConcurrentSessions() {
        List<com.exam.seating.dto.response.ConcurrentExamSessionDto> sessions = examService.getConcurrentExamSessions();
        return ResponseEntity.ok(ApiResponse.success("Concurrent exam sessions retrieved successfully", sessions));
    }
}
