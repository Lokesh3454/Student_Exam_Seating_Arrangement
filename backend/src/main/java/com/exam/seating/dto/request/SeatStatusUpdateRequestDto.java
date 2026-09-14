package com.exam.seating.dto.request;

import com.exam.seating.entity.enums.SeatStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatStatusUpdateRequestDto {

    @NotNull(message = "Seat status is required")
    private SeatStatus status;
}
