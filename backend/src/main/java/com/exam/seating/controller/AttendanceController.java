package com.exam.seating.controller;

import com.exam.seating.dto.AttendanceStudentDto;
import com.exam.seating.dto.AttendanceUpdateRequest;
import com.exam.seating.dto.HallAttendanceResponse;
import com.exam.seating.dto.SaveAttendanceRequest;
import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Slf4j
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/exam/{examId}/hall/{hallId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<HallAttendanceResponse>> getHallAttendance(
            @PathVariable Long examId,
            @PathVariable Long hallId) {

        log.info("REST: Fetching attendance for exam ID {} and hall ID {}", examId, hallId);
        HallAttendanceResponse response = attendanceService.getHallAttendance(examId, hallId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<HallAttendanceResponse>> saveAttendance(
            @Valid @RequestBody SaveAttendanceRequest request) {

        log.info("REST: Saving attendance for exam ID {} and hall ID {}", request.getExamId(), request.getHallId());
        HallAttendanceResponse response = attendanceService.saveAttendance(request);
        return ResponseEntity.ok(ApiResponse.success("Attendance saved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<AttendanceStudentDto>> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceUpdateRequest request) {

        log.info("REST: Updating attendance ID {} with status {}", id, request.getStatus());
        AttendanceStudentDto response = attendanceService.updateAttendanceStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Attendance record updated", response));
    }

    @GetMapping("/summary/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendanceSummary(
            @PathVariable Long examId) {

        log.info("REST: Fetching attendance summary for exam ID {}", examId);
        Map<String, Object> summary = attendanceService.getExamAttendanceSummary(examId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
