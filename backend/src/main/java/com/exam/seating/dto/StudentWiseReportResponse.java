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
public class StudentWiseReportResponse {

    private String registerNumber;
    private String studentName;
    private String branch;
    private Integer year;
    private String section;

    private Long examId;
    private String examName;
    private String subject;
    private LocalDate examDate;

    private String hallNumber;
    private String building;
    private String seatNumber;
    private Integer rowNumber;
    private Integer columnNumber;

    private String attendanceStatus;
}
