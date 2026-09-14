package com.exam.seating.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSeatSearchResponseDto {

    private String studentName;
    private String registerNumber;
    private String exam;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String hall;
    private Integer hallRows;
    private Integer hallColumns;
    private Integer row;
    private Integer column;
    private String seat;
}
