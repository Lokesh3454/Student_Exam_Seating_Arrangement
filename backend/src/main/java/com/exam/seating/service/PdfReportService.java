package com.exam.seating.service;

public interface PdfReportService {

    byte[] generateExamSeatingPdf(Long examId);

    byte[] generateHallSeatingChartPdf(Long hallId, Long examId);

    byte[] generateStudentWiseReportPdf(Long examId, String keyword);

    byte[] generateAttendanceRosterPdf(Long examId, Long hallId);

    byte[] generateAdmitCardPdf(Long examId, Long studentId);
}
