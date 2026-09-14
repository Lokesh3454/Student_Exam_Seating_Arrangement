package com.exam.seating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallWiseReportResponse {

    private Long hallId;
    private String hallNumber;
    private String building;
    private Integer floor;
    private Integer capacity;

    private Long examId;
    private String examName;
    private String subject;
    private int studentCount;
    private double occupancyPercentage;

    private String assignedFacultyName;
    private String assignedFacultyEmpId;

    private List<SeatAssignmentItem> seatAssignments;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeatAssignmentItem {
        private String seatNumber;
        private int rowNumber;
        private int columnNumber;
        private String studentRegisterNumber;
        private String studentName;
        private String branch;
    }
}
