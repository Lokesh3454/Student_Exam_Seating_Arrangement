package com.exam.seating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamWiseReportResponse {

    private Long examId;
    private String examName;
    private String subject;
    private LocalDate examDate;
    private String timeSlot;
    private int enrolledStudentsCount;
    private int hallsUsedCount;
    private int totalSeatsAssigned;
    private int presentCount;
    private int absentCount;
    private double attendancePercentage;
    private String status;
}
