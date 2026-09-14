package com.exam.seating.controller;

import com.exam.seating.dto.request.SeatStatusUpdateRequestDto;
import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.dto.response.SeatResponseDto;
import com.exam.seating.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/hall/{hallId}")
    public ResponseEntity<ApiResponse<List<SeatResponseDto>>> getSeatsByHallId(@PathVariable Long hallId) {
        List<SeatResponseDto> seats = seatService.getSeatsByHallId(hallId);
        return ResponseEntity.ok(ApiResponse.success("Seats retrieved successfully", seats));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatResponseDto>> getSeatById(@PathVariable Long id) {
        SeatResponseDto seat = seatService.getSeatById(id);
        return ResponseEntity.ok(ApiResponse.success("Seat retrieved successfully", seat));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SeatResponseDto>> updateSeatStatus(
            @PathVariable Long id,
            @Valid @RequestBody SeatStatusUpdateRequestDto dto) {
        SeatResponseDto updated = seatService.updateSeatStatus(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Seat status updated successfully", updated));
    }
}
