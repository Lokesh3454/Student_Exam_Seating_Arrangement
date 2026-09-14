package com.exam.seating.dto.response;

import com.exam.seating.entity.enums.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatResponseDto {

    private Long id;
    private Long hallId;
    private String hallNumber;
    private Integer rowNumber;
    private Integer columnNumber;
    private String seatNumber;
    private SeatStatus status;
}
