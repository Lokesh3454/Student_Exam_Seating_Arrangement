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
public class SeatingArrangementDetailDto {

    private Long id;
    private Long examId;
    private String examName;
    private Long studentId;
    private String studentRegisterNumber;
    private String studentName;
    private String studentBranch;
    private String studentSection;
    private Long hallId;
    private String hallNumber;
    private String building;
    private Long seatId;
    private String seatNumber;
    private Integer rowNumber;
    private Integer columnNumber;
    private LocalDateTime arrangementDate;
}
