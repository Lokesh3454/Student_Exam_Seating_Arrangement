package com.exam.seating.service;

import com.exam.seating.dto.request.SeatStatusUpdateRequestDto;
import com.exam.seating.dto.response.SeatResponseDto;

import java.util.List;

public interface SeatService {

    List<SeatResponseDto> getSeatsByHallId(Long hallId);

    SeatResponseDto getSeatById(Long id);

    SeatResponseDto updateSeatStatus(Long id, SeatStatusUpdateRequestDto dto);
}
