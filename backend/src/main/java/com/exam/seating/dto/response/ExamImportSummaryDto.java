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
public class ExamImportSummaryDto {

    private int totalRows;
    private int successfullyImported;
    private int failedRows;
    private int duplicateRows;

    @Builder.Default
    private List<ExamImportErrorDto> errors = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExamImportErrorDto {
        private int rowNumber;
        private String examName;
        private String reason;
    }
}
