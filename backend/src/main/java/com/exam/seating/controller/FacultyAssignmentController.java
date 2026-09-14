package com.exam.seating.controller;

import com.exam.seating.dto.FacultyAssignmentRequest;
import com.exam.seating.dto.FacultyAssignmentResponse;
import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.service.FacultyAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty/assignments")
@RequiredArgsConstructor
@Slf4j
public class FacultyAssignmentController {

    private final FacultyAssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FacultyAssignmentResponse>> assignFaculty(
            @Valid @RequestBody FacultyAssignmentRequest request) {

        log.info("REST: Assigning faculty {} to exam {} in hall {}",
                request.getFacultyId(), request.getExamId(), request.getHallId());

        FacultyAssignmentResponse response = assignmentService.assignFacultyToHall(request);
        return new ResponseEntity<>(
                ApiResponse.success("Faculty assigned to examination hall successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<FacultyAssignmentResponse>>> getAllAssignments(
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) Long hallId,
            @RequestParam(required = false) Long facultyId) {

        List<FacultyAssignmentResponse> list = assignmentService.getAllAssignments(examId, hallId, facultyId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<FacultyAssignmentResponse>>> getAssignmentsByExam(
            @PathVariable Long examId) {
        List<FacultyAssignmentResponse> list = assignmentService.getAllAssignments(examId, null, null);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/faculty/{facultyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<FacultyAssignmentResponse>>> getAssignmentsByFaculty(
            @PathVariable Long facultyId) {
        List<FacultyAssignmentResponse> list = assignmentService.getAllAssignments(null, null, facultyId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/my-duties")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<FacultyAssignmentResponse>>> getMyAssignedDuties(
            Authentication authentication) {

        String username = authentication.getName();
        log.info("REST: Fetching assigned hall duties for faculty username: {}", username);

        List<FacultyAssignmentResponse> duties = assignmentService.getMyAssignedDuties(username);
        return ResponseEntity.ok(ApiResponse.success(duties));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Long id) {
        log.info("REST: Deleting faculty assignment ID: {}", id);
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty assignment removed successfully", null));
    }
}
