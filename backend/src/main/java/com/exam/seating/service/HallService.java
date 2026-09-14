package com.exam.seating.service;

import com.exam.seating.dto.request.HallRequestDto;
import com.exam.seating.dto.response.HallResponseDto;

import java.util.List;

public interface HallService {

    List<HallResponseDto> getAllHalls();

    HallResponseDto getHallById(Long id);

    HallResponseDto createHall(HallRequestDto dto);

    HallResponseDto updateHall(Long id, HallRequestDto dto);

    void deleteHall(Long id);

    com.exam.seating.dto.response.HallImportSummaryDto importHallsFromCsv(org.springframework.web.multipart.MultipartFile file);
}
