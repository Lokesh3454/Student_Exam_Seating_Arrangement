package com.exam.seating.controller;

import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.entity.AuditLog;
import com.exam.seating.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs(
            @RequestParam(required = false) String search) {
        List<AuditLog> logs = (search != null && !search.isBlank())
                ? auditLogService.searchLogs(search)
                : auditLogService.getAllLogs();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
