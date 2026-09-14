package com.exam.seating.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> rootPing() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Smart Exam Seating Arrangement API",
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping({"/api/health", "/api/ping"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "message", "Service is healthy and active",
                "timestamp", Instant.now().toString()
        ));
    }
}
