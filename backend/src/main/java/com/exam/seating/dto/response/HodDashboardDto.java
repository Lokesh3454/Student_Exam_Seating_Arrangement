package com.exam.seating.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HodDashboardDto {
    private String branch;
    private String departmentName;
    private long totalStudents;
    private long totalExams;
    private int totalAllottedSeats;
    private int totalEnrolledStudents;
    private int seatingAllocatedCount;
    private long incidentsCount;
    private List<ExamResponseDto> upcomingExams;
    private List<DepartmentHallMetricDto> allottedHalls;
    private List<IncidentResponseDto> recentIncidents;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentHallMetricDto {
        private Long hallId;
        private String hallNumber;
        private String building;
        private Integer capacity;
        private Integer assignedCount;
        private boolean filled;
    }
}
