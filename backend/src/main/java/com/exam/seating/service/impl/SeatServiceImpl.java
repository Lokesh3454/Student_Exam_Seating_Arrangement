package com.exam.seating.service.impl;

import com.exam.seating.dto.request.SeatStatusUpdateRequestDto;
import com.exam.seating.dto.response.SeatResponseDto;
import com.exam.seating.entity.Seat;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.HallRepository;
import com.exam.seating.repository.SeatRepository;
import com.exam.seating.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final HallRepository hallRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SeatResponseDto> getSeatsByHallId(Long hallId) {
        if (!hallRepository.existsById(hallId)) {
            throw new ResourceNotFoundException("Hall", "id", hallId);
        }
        return seatRepository.findByHallIdOrderByRowNumberAscColumnNumberAsc(hallId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SeatResponseDto getSeatById(Long id) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", id));
        return mapToDto(seat);
    }

    @Override
    public SeatResponseDto updateSeatStatus(Long id, SeatStatusUpdateRequestDto dto) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", id));
        seat.setStatus(dto.getStatus());
        Seat updated = seatRepository.save(seat);
        return mapToDto(updated);
    }

    private SeatResponseDto mapToDto(Seat seat) {
        return SeatResponseDto.builder()
                .id(seat.getId())
                .hallId(seat.getHall().getId())
                .hallNumber(seat.getHall().getHallNumber())
                .rowNumber(seat.getRowNumber())
                .columnNumber(seat.getColumnNumber())
                .seatNumber(seat.getSeatNumber())
                .status(seat.getStatus())
                .build();
    }
}
