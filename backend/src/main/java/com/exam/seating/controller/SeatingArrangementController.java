package com.exam.seating.controller;

import com.exam.seating.dto.request.GenerateSeatingRequestDto;
import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.dto.response.SeatingArrangementDetailDto;
import com.exam.seating.dto.response.SeatingGenerationResponseDto;
import com.exam.seating.dto.response.StudentSeatSearchResponseDto;
import com.exam.seating.service.SeatingArrangementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seating")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeatingArrangementController {

    private final SeatingArrangementService seatingArrangementService;

    @PostMapping("/generate/{examId}")
    public ResponseEntity<ApiResponse<SeatingGenerationResponseDto>> generateSeating(
            @PathVariable Long examId,
            @RequestBody(required = false) GenerateSeatingRequestDto requestDto) {
        SeatingGenerationResponseDto response = seatingArrangementService.generateSeatingArrangement(examId, requestDto);
        return new ResponseEntity<>(
                ApiResponse.success("Seating arrangement generated successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/regenerate/{examId}")
    public ResponseEntity<ApiResponse<SeatingGenerationResponseDto>> regenerateSeating(
            @PathVariable Long examId,
            @RequestBody(required = false) GenerateSeatingRequestDto requestDto) {
        SeatingGenerationResponseDto response = seatingArrangementService.regenerateSeatingArrangement(examId, requestDto);
        return ResponseEntity.ok(
                ApiResponse.success("Seating arrangement regenerated successfully", response)
        );
    }

    @PostMapping("/validate-conflicts/{examId}")
    public ResponseEntity<ApiResponse<com.exam.seating.dto.response.ConflictCheckResponseDto>> validateConflicts(
            @PathVariable Long examId,
            @RequestBody(required = false) GenerateSeatingRequestDto requestDto) {
        List<Long> hallIds = requestDto != null ? requestDto.getHallIds() : null;
        com.exam.seating.dto.response.ConflictCheckResponseDto response = seatingArrangementService.validateConflicts(examId, hallIds);
        return ResponseEntity.ok(
                ApiResponse.success("Pre-generation conflict diagnosis completed", response)
        );
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<ApiResponse<List<SeatingArrangementDetailDto>>> getArrangementByExam(
            @PathVariable Long examId) {
        List<SeatingArrangementDetailDto> arrangements = seatingArrangementService.getArrangementByExamId(examId);
        return ResponseEntity.ok(
                ApiResponse.success("Exam seating arrangement retrieved successfully", arrangements)
        );
    }

    @GetMapping("/hall/{hallId}/exam/{examId}")
    public ResponseEntity<ApiResponse<List<SeatingArrangementDetailDto>>> getArrangementByHallAndExam(
            @PathVariable Long hallId,
            @PathVariable Long examId) {
        List<SeatingArrangementDetailDto> arrangements = seatingArrangementService.getArrangementByHallAndExam(hallId, examId);
        return ResponseEntity.ok(
                ApiResponse.success("Hall seating arrangement retrieved successfully", arrangements)
        );
    }

    @GetMapping("/student/{registerNumber}/exam/{examId}")
    public ResponseEntity<ApiResponse<StudentSeatSearchResponseDto>> searchStudentSeat(
            @PathVariable String registerNumber,
            @PathVariable Long examId) {
        StudentSeatSearchResponseDto result = seatingArrangementService.searchStudentSeat(registerNumber, examId);
        return ResponseEntity.ok(
                ApiResponse.success("Student seat details retrieved successfully", result)
        );
    }

    @DeleteMapping("/exam/{examId}")
    public ResponseEntity<ApiResponse<Void>> deleteArrangementByExam(@PathVariable Long examId) {
        seatingArrangementService.deleteArrangementByExamId(examId);
        return ResponseEntity.ok(
                ApiResponse.success("Seating arrangement deleted successfully", null)
        );
    }
}
