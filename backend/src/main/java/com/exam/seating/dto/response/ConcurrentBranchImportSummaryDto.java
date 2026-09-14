package com.exam.seating.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConcurrentBranchImportSummaryDto {

    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private int totalBranchesProcessed;
    private int totalStudentsImported;
    private int totalDuplicates;
    private int totalFailed;
    private String overallStatus;

    @Builder.Default
    private List<BranchImportResultDto> branchResults = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchImportResultDto {
        private String branch;
        private Long examId;
        private String examName;
        private String subject;
        private String fileName;
        private int totalRows;
        private int successfullyImported;
        private int duplicateRows;
        private int failedRows;

        @Builder.Default
        private List<StudentImportSummaryDto.ImportRowErrorDto> errors = new ArrayList<>();

        @Builder.Default
        private List<StudentImportSummaryDto.HallAllocationDto> hallAllocations = new ArrayList<>();
    }
}
