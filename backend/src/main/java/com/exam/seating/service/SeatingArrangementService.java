package com.exam.seating.service;

import com.exam.seating.dto.request.GenerateSeatingRequestDto;
import com.exam.seating.dto.response.SeatingArrangementDetailDto;
import com.exam.seating.dto.response.SeatingGenerationResponseDto;
import com.exam.seating.dto.response.StudentSeatSearchResponseDto;

import java.util.List;

public interface SeatingArrangementService {

    SeatingGenerationResponseDto generateSeatingArrangement(Long examId, GenerateSeatingRequestDto requestDto);

    SeatingGenerationResponseDto regenerateSeatingArrangement(Long examId, GenerateSeatingRequestDto requestDto);

    List<SeatingArrangementDetailDto> getArrangementByExamId(Long examId);

    List<SeatingArrangementDetailDto> getArrangementByHallAndExam(Long hallId, Long examId);

    StudentSeatSearchResponseDto searchStudentSeat(String registerNumber, Long examId);

    void deleteArrangementByExamId(Long examId);

    com.exam.seating.dto.response.ConflictCheckResponseDto validateConflicts(Long examId, List<Long> hallIds);
}
