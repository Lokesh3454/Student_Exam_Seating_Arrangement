package com.exam.seating.controller;

import com.exam.seating.dto.request.HallRequestDto;
import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.dto.response.HallResponseDto;
import com.exam.seating.dto.response.SeatResponseDto;
import com.exam.seating.service.HallService;
import com.exam.seating.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/halls")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HallController {

    private final HallService hallService;
    private final SeatService seatService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HallResponseDto>>> getAllHalls() {
        List<HallResponseDto> halls = hallService.getAllHalls();
        return ResponseEntity.ok(ApiResponse.success("Halls retrieved successfully", halls));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HallResponseDto>> getHallById(@PathVariable Long id) {
        HallResponseDto hall = hallService.getHallById(id);
        return ResponseEntity.ok(ApiResponse.success("Hall retrieved successfully", hall));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<ApiResponse<List<SeatResponseDto>>> getSeatsByHallId(@PathVariable Long id) {
        List<SeatResponseDto> seats = seatService.getSeatsByHallId(id);
        return ResponseEntity.ok(ApiResponse.success("Hall seats retrieved successfully", seats));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HallResponseDto>> createHall(
            @Valid @RequestBody HallRequestDto dto) {
        HallResponseDto created = hallService.createHall(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Hall created and seats generated successfully", created),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HallResponseDto>> updateHall(
            @PathVariable Long id,
            @Valid @RequestBody HallRequestDto dto) {
        HallResponseDto updated = hallService.updateHall(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Hall updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHall(@PathVariable Long id) {
        hallService.deleteHall(id);
        return ResponseEntity.ok(ApiResponse.success("Hall and associated seats deleted successfully", null));
    }

    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<com.exam.seating.dto.response.HallImportSummaryDto>> importHalls(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        com.exam.seating.dto.response.HallImportSummaryDto summary = hallService.importHallsFromCsv(file);
        return ResponseEntity.ok(ApiResponse.success("Hall CSV processing completed", summary));
    }

    @GetMapping("/csv-template")
    public ResponseEntity<byte[]> getCsvTemplate() {
        String csv = "hallNumber,building,floor,rowsCount,columnsCount\n" +
                "LH-101,Science Block,1,5,3\n" +
                "LH-102,Science Block,1,5,3\n" +
                "LH-201,Engineering Block,2,5,3\n" +
                "LH-202,Engineering Block,2,5,3\n" +
                "LH-301,Main Academic Block,3,5,3\n" +
                "LH-302,Main Academic Block,3,5,3\n";
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("text/csv"));
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment().filename("halls_template.csv").build());
        return ResponseEntity.ok().headers(headers).body(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
