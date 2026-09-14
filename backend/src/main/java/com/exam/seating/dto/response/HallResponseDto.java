package com.exam.seating.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallResponseDto {

    private Long id;
    private String hallNumber;
    private String building;
    private Integer floor;
    private Integer rowsCount;
    private Integer columnsCount;
    private Integer capacity;
    private Long totalSeats;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
