package com.exam.seating.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponseDto {
    private long totalStudents;
    private long totalHalls;
    private long totalExams;
    private long totalFaculty;
    private long totalSeats;
    private long availableSeats;
    private long occupiedSeats;
    private long upcomingExamsCount;

    @Builder.Default
    private List<UpcomingExamDto> upcomingExams = new ArrayList<>();

    @Builder.Default
    private Map<String, Long> branchDistribution = new HashMap<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpcomingExamDto {
        private Long id;
        private String examCode;
        private String title;
        private LocalDate examDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private int assignedStudents;
        private String status;
    }
}
