package com.exam.seating.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentImportSummaryDto {
    private int totalRows;
    private int successfullyImported;
    private int failedRows;
    private int duplicateRows;

    private Long examId;
    private String examName;

    @Builder.Default
    private List<HallAllocationDto> hallAllocations = new ArrayList<>();
    
    @Builder.Default
    private List<ImportRowErrorDto> errors = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HallAllocationDto {
        private Long hallId;
        private String hallNumber;
        private String building;
        private int capacity;
        private int assignedCount;
        private boolean filled;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImportRowErrorDto {
        private int rowNumber;
        private String registerNumber;
        private String reason;
    }
}
