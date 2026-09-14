package com.exam.seating.controller;

import com.exam.seating.dto.request.StudentRequestDto;
import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.dto.response.StudentResponseDto;
import com.exam.seating.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentResponseDto>>> getAllStudents() {
        List<StudentResponseDto> students = studentService.getAllStudents();
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", students));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponseDto>> getStudentById(@PathVariable Long id) {
        StudentResponseDto student = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved successfully", student));
    }

    @GetMapping("/register/{registerNumber}")
    public ResponseEntity<ApiResponse<StudentResponseDto>> getStudentByRegisterNumber(
            @PathVariable String registerNumber) {
        StudentResponseDto student = studentService.getStudentByRegisterNumber(registerNumber);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved successfully", student));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StudentResponseDto>> getMyProfile(Principal principal) {
        StudentResponseDto student = studentService.getMyProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Student profile retrieved successfully", student));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<StudentResponseDto>>> searchStudents(
            @RequestParam(required = false) String keyword) {
        List<StudentResponseDto> students = studentService.searchStudents(keyword);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", students));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentResponseDto>> createStudent(
            @Valid @RequestBody StudentRequestDto dto) {
        StudentResponseDto created = studentService.createStudent(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Student registered successfully", created),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponseDto>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequestDto dto) {
        StudentResponseDto updated = studentService.updateStudent(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }

    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<com.exam.seating.dto.response.StudentImportSummaryDto>> importStudents(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "examId", required = false) Long examId) {
        com.exam.seating.dto.response.StudentImportSummaryDto summary = studentService.importStudentsFromCsv(file, examId);
        return ResponseEntity.ok(ApiResponse.success("Student CSV processing completed", summary));
    }

    @GetMapping("/csv-template")
    public ResponseEntity<byte[]> getCsvTemplate() {
        String csv = studentService.getConcurrentBranchTemplate("CSE");
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("text/csv"));
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment().filename("students_template.csv").build());
        return ResponseEntity.ok().headers(headers).body(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    @PostMapping(value = "/import-concurrent-branches", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<com.exam.seating.dto.response.ConcurrentBranchImportSummaryDto>> importConcurrentBranchStudents(
            @RequestParam("files") List<org.springframework.web.multipart.MultipartFile> files,
            @RequestParam(value = "branches", required = false) List<String> branches,
            @RequestParam("examDate") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate examDate,
            @RequestParam("startTime") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.TIME) java.time.LocalTime startTime,
            @RequestParam("endTime") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.TIME) java.time.LocalTime endTime,
            @RequestParam(value = "autoAllocateSeating", required = false, defaultValue = "true") Boolean autoAllocateSeating) {

        com.exam.seating.dto.response.ConcurrentBranchImportSummaryDto summary =
                studentService.importConcurrentBranchStudents(files, branches, examDate, startTime, endTime, autoAllocateSeating);
        return ResponseEntity.ok(ApiResponse.success("Concurrent branch CSVs processed successfully", summary));
    }

    @GetMapping("/concurrent-template")
    public ResponseEntity<byte[]> getConcurrentBranchTemplate(@RequestParam(value = "branch", required = false, defaultValue = "CSE") String branch) {
        String csv = studentService.getConcurrentBranchTemplate(branch);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("text/csv"));
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                .filename("students_" + branch.toLowerCase() + "_template.csv").build());
        return ResponseEntity.ok().headers(headers).body(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
