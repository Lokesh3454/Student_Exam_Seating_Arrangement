package com.exam.seating.service;

import com.exam.seating.dto.request.IncidentRequestDto;
import com.exam.seating.dto.response.IncidentResponseDto;
import com.exam.seating.entity.enums.IncidentStatus;

import java.util.List;

public interface IncidentService {

    IncidentResponseDto reportIncident(IncidentRequestDto requestDto, String reportedBy);

    List<IncidentResponseDto> getAllIncidents();

    List<IncidentResponseDto> getIncidentsByExam(Long examId);

    List<IncidentResponseDto> getIncidentsByStudent(Long studentId);

    IncidentResponseDto updateIncidentStatus(Long id, IncidentStatus status, String actionTaken);

    void deleteIncident(Long id);
}
