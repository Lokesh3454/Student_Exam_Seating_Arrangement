package com.exam.seating.service.impl;

import com.exam.seating.dto.request.HallRequestDto;
import com.exam.seating.dto.response.HallResponseDto;
import com.exam.seating.entity.Hall;
import com.exam.seating.entity.Seat;
import com.exam.seating.entity.enums.SeatStatus;
import com.exam.seating.exception.BadRequestException;
import com.exam.seating.exception.DuplicateResourceException;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.HallRepository;
import com.exam.seating.repository.SeatRepository;
import com.exam.seating.service.HallService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HallServiceImpl implements HallService {

    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final com.exam.seating.service.AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<HallResponseDto> getAllHalls() {
        return hallRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HallResponseDto getHallById(Long id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall", "id", id));
        return mapToDto(hall);
    }

    @Override
    public HallResponseDto createHall(HallRequestDto dto) {
        // Validate uniqueness of hall number
        if (hallRepository.existsByHallNumber(dto.getHallNumber().trim())) {
            throw new DuplicateResourceException("Hall", "hallNumber", dto.getHallNumber());
        }

        int rows = (dto.getRowsCount() != null && dto.getRowsCount() > 0) ? dto.getRowsCount() : 5;
        int cols = (dto.getColumnsCount() != null && dto.getColumnsCount() > 0) ? dto.getColumnsCount() : 3;
        int capacity = rows * cols;

        Hall hall = Hall.builder()
                .hallNumber(dto.getHallNumber().trim())
                .building(dto.getBuilding().trim())
                .floor(dto.getFloor() != null ? dto.getFloor() : 1)
                .rowsCount(rows)
                .columnsCount(cols)
                .capacity(capacity)
                .build();

        Hall savedHall = hallRepository.save(hall);

        // Automatically generate all seats for the hall grid
        List<Seat> seats = new ArrayList<>();
        for (int r = 1; r <= rows; r++) {
            for (int c = 1; c <= cols; c++) {
                String seatNumber = String.format("R%d-C%d", r, c);
                Seat seat = Seat.builder()
                        .hall(savedHall)
                        .rowNumber(r)
                        .columnNumber(c)
                        .seatNumber(seatNumber)
                        .status(SeatStatus.AVAILABLE)
                        .build();
                seats.add(seat);
            }
        }
        seatRepository.saveAll(seats);

        return mapToDto(savedHall);
    }

    @Override
    public HallResponseDto updateHall(Long id, HallRequestDto dto) {
        Hall existing = hallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall", "id", id));

        // Check if new hall number conflicts
        if (!existing.getHallNumber().equalsIgnoreCase(dto.getHallNumber().trim()) &&
                hallRepository.existsByHallNumber(dto.getHallNumber().trim())) {
            throw new DuplicateResourceException("Hall", "hallNumber", dto.getHallNumber());
        }

        // Validate dimensions
        if (dto.getRowsCount() <= 0 || dto.getColumnsCount() <= 0) {
            throw new BadRequestException("Hall dimensions must be positive integers (rows > 0, columns > 0)");
        }

        boolean dimensionsChanged = !existing.getRowsCount().equals(dto.getRowsCount()) ||
                                   !existing.getColumnsCount().equals(dto.getColumnsCount());

        existing.setHallNumber(dto.getHallNumber().trim());
        existing.setBuilding(dto.getBuilding().trim());
        existing.setFloor(dto.getFloor());
        existing.setRowsCount(dto.getRowsCount());
        existing.setColumnsCount(dto.getColumnsCount());
        existing.setCapacity(dto.getRowsCount() * dto.getColumnsCount());

        Hall updated = hallRepository.save(existing);

        // If grid dimensions changed, regenerate seats cleanly
        if (dimensionsChanged) {
            seatRepository.deleteByHallId(existing.getId());
            List<Seat> newSeats = new ArrayList<>();
            for (int r = 1; r <= dto.getRowsCount(); r++) {
                for (int c = 1; c <= dto.getColumnsCount(); c++) {
                    String seatNumber = String.format("R%d-C%d", r, c);
                    Seat seat = Seat.builder()
                            .hall(updated)
                            .rowNumber(r)
                            .columnNumber(c)
                            .seatNumber(seatNumber)
                            .status(SeatStatus.AVAILABLE)
                            .build();
                    newSeats.add(seat);
                }
            }
            seatRepository.saveAll(newSeats);
        }

        return mapToDto(updated);
    }

    @Override
    public void deleteHall(Long id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall", "id", id));
        seatRepository.deleteByHallId(hall.getId());
        hallRepository.delete(hall);
    }

    @Override
    public com.exam.seating.dto.response.HallImportSummaryDto importHallsFromCsv(org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded CSV file cannot be empty");
        }

        com.exam.seating.dto.response.HallImportSummaryDto summary = new com.exam.seating.dto.response.HallImportSummaryDto();
        List<Hall> hallsToSave = new ArrayList<>();
        java.util.Set<String> seenHallNumbers = new java.util.HashSet<>();

        try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String line;
            int rowNumber = 0;
            boolean isFirstLine = true;

            while ((line = reader.readLine()) != null) {
                rowNumber++;
                line = line.trim();
                if (line.isEmpty()) continue;

                if (isFirstLine) {
                    isFirstLine = false;
                    String lower = line.toLowerCase();
                    if (lower.contains("hall") || lower.contains("building") || lower.contains("floor")) {
                        continue;
                    }
                }

                summary.setTotalRows(summary.getTotalRows() + 1);
                String[] tokens = line.split(",");
                if (tokens.length < 5) {
                    summary.setFailedRows(summary.getFailedRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.HallImportSummaryDto.HallImportErrorDto(
                            rowNumber, tokens.length > 0 ? tokens[0].trim() : "ROW_" + rowNumber,
                            "Insufficient columns. Expected: hallNumber, building, floor, rowsCount, columnsCount"
                    ));
                    continue;
                }

                String hallNum = tokens[0].trim().toUpperCase();
                String bldg = tokens[1].trim();
                String floorStr = tokens[2].trim();
                String rowsStr = tokens[3].trim();
                String colsStr = tokens[4].trim();

                if (hallNum.isEmpty() || bldg.isEmpty() || floorStr.isEmpty() || rowsStr.isEmpty() || colsStr.isEmpty()) {
                    summary.setFailedRows(summary.getFailedRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.HallImportSummaryDto.HallImportErrorDto(
                            rowNumber, hallNum, "Missing required values in columns"
                    ));
                    continue;
                }

                if (seenHallNumbers.contains(hallNum) || hallRepository.existsByHallNumber(hallNum)) {
                    summary.setDuplicateRows(summary.getDuplicateRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.HallImportSummaryDto.HallImportErrorDto(
                            rowNumber, hallNum, "Duplicate hall number: '" + hallNum + "' already exists"
                    ));
                    continue;
                }

                try {
                    int floor = Integer.parseInt(floorStr);
                    int rows = Integer.parseInt(rowsStr);
                    int cols = Integer.parseInt(colsStr);

                    if (rows <= 0 || cols <= 0) {
                        summary.setFailedRows(summary.getFailedRows() + 1);
                        summary.getErrors().add(new com.exam.seating.dto.response.HallImportSummaryDto.HallImportErrorDto(
                                rowNumber, hallNum, "Rows and Columns must be positive numbers"
                        ));
                        continue;
                    }

                    int capacity = rows * cols;
                    Hall hall = Hall.builder()
                            .hallNumber(hallNum)
                            .building(bldg)
                            .floor(floor)
                            .rowsCount(rows)
                            .columnsCount(cols)
                            .capacity(capacity)
                            .build();

                    Hall savedHall = hallRepository.save(hall);

                    // Generate seats
                    List<Seat> seats = new ArrayList<>();
                    for (int r = 1; r <= rows; r++) {
                        for (int c = 1; c <= cols; c++) {
                            seats.add(Seat.builder()
                                    .hall(savedHall)
                                    .rowNumber(r)
                                    .columnNumber(c)
                                    .seatNumber(String.format("R%d-C%d", r, c))
                                    .status(SeatStatus.AVAILABLE)
                                    .build());
                        }
                    }
                    seatRepository.saveAll(seats);

                    seenHallNumbers.add(hallNum);
                    summary.setSuccessfullyImported(summary.getSuccessfullyImported() + 1);
                } catch (NumberFormatException e) {
                    summary.setFailedRows(summary.getFailedRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.HallImportSummaryDto.HallImportErrorDto(
                            rowNumber, hallNum, "Invalid numeric format in floor/rows/columns: " + e.getMessage()
                    ));
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse hall CSV: ", e);
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }

        auditLogService.logCurrentUser(
                "BULK_IMPORT_HALLS",
                "Halls (" + summary.getSuccessfullyImported() + " created)",
                "Bulk import completed. Success: " + summary.getSuccessfullyImported() + ", Failed: " + summary.getFailedRows()
        );

        return summary;
    }

    private HallResponseDto mapToDto(Hall hall) {
        long seatCount = seatRepository.countByHallId(hall.getId());
        return HallResponseDto.builder()
                .id(hall.getId())
                .hallNumber(hall.getHallNumber())
                .building(hall.getBuilding())
                .floor(hall.getFloor())
                .rowsCount(hall.getRowsCount())
                .columnsCount(hall.getColumnsCount())
                .capacity(hall.getCapacity())
                .totalSeats(seatCount)
                .createdAt(hall.getCreatedAt())
                .updatedAt(hall.getUpdatedAt())
                .build();
    }
}
