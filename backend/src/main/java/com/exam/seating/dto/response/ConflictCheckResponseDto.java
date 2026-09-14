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
public class ConflictCheckResponseDto {
    private boolean hasConflicts;
    private int eligibleStudentCount;
    private int totalAvailableSeats;
    private int deficitSeats;
    private boolean alreadyGenerated;

    @Builder.Default
    private List<ConflictDetailDto> conflicts = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConflictDetailDto {
        private String type; // INSUFFICIENT_SEATS, ALREADY_ASSIGNED, DUPLICATE_SEAT, OVERLAPPING_EXAM, INVALID_HALL, INVALID_EXAM
        private String severity; // ERROR, WARNING, INFO
        private String message;
    }
}
