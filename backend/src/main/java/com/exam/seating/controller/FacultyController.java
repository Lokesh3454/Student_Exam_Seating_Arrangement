package com.exam.seating.controller;

import com.exam.seating.dto.request.FacultyRequestDto;
import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.dto.response.FacultyResponseDto;
import com.exam.seating.service.FacultyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacultyController {

    private final FacultyService facultyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FacultyResponseDto>>> getAllFaculty() {
        List<FacultyResponseDto> facultyList = facultyService.getAllFaculty();
        return ResponseEntity.ok(ApiResponse.success("Faculty members retrieved successfully", facultyList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyResponseDto>> getFacultyById(@PathVariable Long id) {
        FacultyResponseDto faculty = facultyService.getFacultyById(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty member retrieved successfully", faculty));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FacultyResponseDto>> createFaculty(
            @Valid @RequestBody FacultyRequestDto dto) {
        FacultyResponseDto created = facultyService.createFaculty(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Faculty member created successfully", created),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyResponseDto>> updateFaculty(
            @PathVariable Long id,
            @Valid @RequestBody FacultyRequestDto dto) {
        FacultyResponseDto updated = facultyService.updateFaculty(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Faculty member updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty member deleted successfully", null));
    }
}
