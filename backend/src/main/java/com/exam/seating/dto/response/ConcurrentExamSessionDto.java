package com.exam.seating.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConcurrentExamSessionDto {

    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String sessionLabel;
    private int totalBranches;
    private List<ExamResponseDto> branchExams;
    private int totalEnrolled;
    private int totalAllottedCapacity;
}
