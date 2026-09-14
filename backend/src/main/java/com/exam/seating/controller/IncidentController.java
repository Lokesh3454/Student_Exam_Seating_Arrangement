package com.exam.seating.controller;

import com.exam.seating.dto.request.IncidentRequestDto;
import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.dto.response.IncidentResponseDto;
import com.exam.seating.entity.enums.IncidentStatus;
import com.exam.seating.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<ApiResponse<IncidentResponseDto>> reportIncident(
            @Valid @RequestBody IncidentRequestDto requestDto,
            Principal principal) {
        String reportedBy = principal != null ? principal.getName() : "INVIGILATOR";
        IncidentResponseDto response = incidentService.reportIncident(requestDto, reportedBy);
        return new ResponseEntity<>(ApiResponse.success("Malpractice incident reported successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<ApiResponse<List<IncidentResponseDto>>> getAllIncidents(
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) Long studentId) {
        List<IncidentResponseDto> list;
        if (examId != null) {
            list = incidentService.getIncidentsByExam(examId);
        } else if (studentId != null) {
            list = incidentService.getIncidentsByStudent(studentId);
        } else {
            list = incidentService.getAllIncidents();
        }
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<ApiResponse<IncidentResponseDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String statusStr = payload.get("status");
        String actionTaken = payload.get("actionTaken");
        IncidentStatus status = IncidentStatus.valueOf(statusStr);
        IncidentResponseDto response = incidentService.updateIncidentStatus(id, status, actionTaken);
        return ResponseEntity.ok(ApiResponse.success("Incident status updated", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.ok(ApiResponse.success("Incident deleted successfully", null));
    }
}
