package com.exam.seating.service;

import com.exam.seating.entity.AuditLog;

import java.util.List;

public interface AuditLogService {

    void log(String username, String userRole, String action, String targetEntity, String details);

    void logCurrentUser(String action, String targetEntity, String details);

    List<AuditLog> getAllLogs();

    List<AuditLog> searchLogs(String query);
}
