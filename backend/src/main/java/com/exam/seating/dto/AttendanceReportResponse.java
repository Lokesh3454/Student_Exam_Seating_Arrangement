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
public class AttendanceReportResponse {

    private Long examId;
    private String examName;
    private String subject;
    private LocalDate examDate;
    private Long hallId;
    private String hallNumber;
    private String building;

    private int totalStudents;
    private int present;
    private int absent;
    private int malpractice;
    private double attendancePercentage;
}
