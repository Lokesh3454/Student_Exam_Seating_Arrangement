package com.exam.seating.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallRequestDto {

    @NotBlank(message = "Hall number is required")
    private String hallNumber;

    @NotBlank(message = "Building name is required")
    private String building;

    @NotNull(message = "Floor is required")
    private Integer floor;

    @NotNull(message = "Rows count is required")
    @Min(value = 1, message = "Rows count must be at least 1")
    @Max(value = 50, message = "Rows count cannot exceed 50")
    private Integer rowsCount;

    @NotNull(message = "Columns count is required")
    @Min(value = 1, message = "Columns count must be at least 1")
    @Max(value = 50, message = "Columns count cannot exceed 50")
    private Integer columnsCount;
}
