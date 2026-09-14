package com.exam.seating.service.impl;

import com.exam.seating.entity.*;
import com.exam.seating.entity.enums.AttendanceStatus;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.*;
import com.exam.seating.service.PdfReportService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PdfReportServiceImpl implements PdfReportService {

    private final ExamRepository examRepository;
    private final HallRepository hallRepository;
    private final SeatingArrangementRepository seatingArrangementRepository;
    private final AttendanceRepository attendanceRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final StudentRepository studentRepository;

    private static final Color PRIMARY_COLOR = new Color(30, 41, 59); // Slate dark
    private static final Color SECONDARY_COLOR = new Color(71, 85, 105);
    private static final Color HEADER_BG = new Color(37, 99, 235); // Royal Blue
    private static final Color ROW_ALT_BG = new Color(248, 250, 252);
    private static final Color BORDER_COLOR = new Color(226, 232, 240);

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, PRIMARY_COLOR);
    private static final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10, SECONDARY_COLOR);
    private static final Font SECTION_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, PRIMARY_COLOR);
    private static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font CELL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);
    private static final Font CELL_BOLD_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, PRIMARY_COLOR);

    @Override
    public byte[] generateExamSeatingPdf(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        List<SeatingArrangement> arrangements = seatingArrangementRepository.findFullArrangementByExamId(examId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 30, 30, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Title & Institution Header
            addHeader(document, "EXAMINATION SEATING ARRANGEMENT MASTER ROSTER",
                    "Exam: " + exam.getExamName() + " (" + exam.getSubject() + ")");

            // Exam Info Card
            PdfPTable infoTable = new PdfPTable(4);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(8f);
            infoTable.setSpacingAfter(12f);

            addInfoCell(infoTable, "Subject:", exam.getSubject() != null ? exam.getSubject() : "-");
            addInfoCell(infoTable, "Date:", exam.getExamDate() != null ? exam.getExamDate().toString() : "-");
            addInfoCell(infoTable, "Time:", formatTimeSlot(exam));
            addInfoCell(infoTable, "Total Seated:", String.valueOf(arrangements.size()));

            document.add(infoTable);

            // Seating Roster Table
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.0f, 2.5f, 3.5f, 2.0f, 1.2f, 2.0f, 1.8f});

            addTableHeader(table, "Sl.", "Register No", "Student Name", "Branch", "Sec", "Hall", "Seat");

            int index = 1;
            for (SeatingArrangement sa : arrangements) {
                Color bg = (index % 2 == 0) ? ROW_ALT_BG : Color.WHITE;
                addTableCell(table, String.valueOf(index++), Element.ALIGN_CENTER, bg);
                addTableCell(table, sa.getStudent().getRegisterNumber(), Element.ALIGN_LEFT, bg, true);
                addTableCell(table, sa.getStudent().getName(), Element.ALIGN_LEFT, bg);
                addTableCell(table, sa.getStudent().getBranch(), Element.ALIGN_CENTER, bg);
                addTableCell(table, sa.getStudent().getSection(), Element.ALIGN_CENTER, bg);
                addTableCell(table, sa.getHall().getHallNumber(), Element.ALIGN_CENTER, bg);
                addTableCell(table, sa.getSeat().getSeatNumber(), Element.ALIGN_CENTER, bg, true);
            }

            if (arrangements.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No seating arrangements generated for this exam yet.", CELL_FONT));
                emptyCell.setColspan(7);
                emptyCell.setPadding(12f);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(emptyCell);
            }

            document.add(table);
            addFooter(document);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Exam Seating PDF: ", e);
            throw new RuntimeException("Could not generate Exam Seating PDF: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] generateHallSeatingChartPdf(Long hallId, Long examId) {
        Hall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("Hall", "id", hallId));
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        List<SeatingArrangement> arrangements = seatingArrangementRepository.findArrangementDetailsByExamAndHall(examId, hallId);
        List<FacultyAssignment> duty = facultyAssignmentRepository.findByExamIdAndHallId(examId, hallId);
        String invigilator = duty.isEmpty() ? "Unassigned" : duty.get(0).getFaculty().getName() + " (" + duty.get(0).getFaculty().getEmployeeId() + ")";

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 30, 30, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "EXAMINATION HALL DOOR SEATING NOTICE",
                    "Hall: " + hall.getHallNumber() + " | Building: " + (hall.getBuilding() != null ? hall.getBuilding() : "-") + " (Floor " + hall.getFloor() + ")");

            // Hall Meta Info
            PdfPTable metaTable = new PdfPTable(4);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingBefore(6f);
            metaTable.setSpacingAfter(10f);

            addInfoCell(metaTable, "Exam:", exam.getExamName());
            addInfoCell(metaTable, "Date:", exam.getExamDate() != null ? exam.getExamDate().toString() : "-");
            addInfoCell(metaTable, "Time:", formatTimeSlot(exam));
            addInfoCell(metaTable, "Invigilator:", invigilator);

            document.add(metaTable);

            // Desk Assignment Table
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.8f, 1.2f, 1.2f, 3.0f, 4.0f, 2.0f});

            addTableHeader(table, "Seat No", "Row", "Col", "Register Number", "Student Name", "Branch");

            int index = 1;
            for (SeatingArrangement sa : arrangements) {
                Color bg = (index++ % 2 == 0) ? ROW_ALT_BG : Color.WHITE;
                addTableCell(table, sa.getSeat().getSeatNumber(), Element.ALIGN_CENTER, bg, true);
                addTableCell(table, String.valueOf(sa.getSeat().getRowNumber()), Element.ALIGN_CENTER, bg);
                addTableCell(table, String.valueOf(sa.getSeat().getColumnNumber()), Element.ALIGN_CENTER, bg);
                addTableCell(table, sa.getStudent().getRegisterNumber(), Element.ALIGN_LEFT, bg, true);
                addTableCell(table, sa.getStudent().getName(), Element.ALIGN_LEFT, bg);
                addTableCell(table, sa.getStudent().getBranch(), Element.ALIGN_CENTER, bg);
            }

            if (arrangements.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No candidates assigned to this hall for this exam.", CELL_FONT));
                emptyCell.setColspan(6);
                emptyCell.setPadding(12f);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(emptyCell);
            }

            document.add(table);
            addFooter(document);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Hall Seating Chart PDF: ", e);
            throw new RuntimeException("Could not generate Hall Seating Chart PDF: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] generateStudentWiseReportPdf(Long examId, String keyword) {
        Exam exam = null;
        if (examId != null) {
            exam = examRepository.findById(examId).orElse(null);
        }

        List<SeatingArrangement> list = (examId != null)
                ? seatingArrangementRepository.findFullArrangementByExamId(examId)
                : seatingArrangementRepository.findAll();

        String search = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim().toLowerCase() : null;

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 30, 30, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            String subtitle = exam != null ? "Exam: " + exam.getExamName() + " (" + exam.getSubject() + ")" : "All Scheduled Examinations";
            addHeader(document, "STUDENT-WISE SEATING ALLOCATION ROSTER", subtitle);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.0f, 2.5f, 3.5f, 1.8f, 1.2f, 2.2f, 1.8f});

            addTableHeader(table, "Sl.", "Register No", "Student Name", "Branch", "Year", "Hall No", "Seat No");

            int index = 1;
            for (SeatingArrangement sa : list) {
                Student s = sa.getStudent();
                if (search != null) {
                    boolean match = (s.getRegisterNumber() != null && s.getRegisterNumber().toLowerCase().contains(search))
                            || (s.getName() != null && s.getName().toLowerCase().contains(search))
                            || (s.getBranch() != null && s.getBranch().toLowerCase().contains(search));
                    if (!match) continue;
                }

                Color bg = (index % 2 == 0) ? ROW_ALT_BG : Color.WHITE;
                addTableCell(table, String.valueOf(index++), Element.ALIGN_CENTER, bg);
                addTableCell(table, s.getRegisterNumber(), Element.ALIGN_LEFT, bg, true);
                addTableCell(table, s.getName(), Element.ALIGN_LEFT, bg);
                addTableCell(table, s.getBranch(), Element.ALIGN_CENTER, bg);
                addTableCell(table, String.valueOf(s.getYear()), Element.ALIGN_CENTER, bg);
                addTableCell(table, sa.getHall().getHallNumber(), Element.ALIGN_CENTER, bg);
                addTableCell(table, sa.getSeat().getSeatNumber(), Element.ALIGN_CENTER, bg, true);
            }

            if (index == 1) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No matching student records found.", CELL_FONT));
                emptyCell.setColspan(7);
                emptyCell.setPadding(12f);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(emptyCell);
            }

            document.add(table);
            addFooter(document);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Student Wise Report PDF: ", e);
            throw new RuntimeException("Could not generate Student Wise Report PDF: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] generateAttendanceRosterPdf(Long examId, Long hallId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        Hall hall = null;
        if (hallId != null) {
            hall = hallRepository.findById(hallId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hall", "id", hallId));
        }

        List<SeatingArrangement> arrangements = (hallId != null)
                ? seatingArrangementRepository.findArrangementDetailsByExamAndHall(examId, hallId)
                : seatingArrangementRepository.findFullArrangementByExamId(examId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 30, 30, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            String hallInfo = hall != null ? "Hall: " + hall.getHallNumber() : "All Examination Halls";
            addHeader(document, "OFFICIAL ATTENDANCE & INVIGILATION REGISTER",
                    "Exam: " + exam.getExamName() + " | " + hallInfo);

            PdfPTable metaTable = new PdfPTable(4);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingBefore(6f);
            metaTable.setSpacingAfter(10f);

            addInfoCell(metaTable, "Date:", exam.getExamDate() != null ? exam.getExamDate().toString() : "-");
            addInfoCell(metaTable, "Time:", formatTimeSlot(exam));
            addInfoCell(metaTable, "Total Enrolled:", String.valueOf(arrangements.size()));
            addInfoCell(metaTable, "Status:", exam.getStatus() != null ? exam.getStatus().name() : "SCHEDULED");

            document.add(metaTable);

            // Attendance table with signature line
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.9f, 2.2f, 3.2f, 1.5f, 1.5f, 2.0f, 2.7f});

            addTableHeader(table, "Sl.", "Register No", "Student Name", "Hall", "Seat", "Status", "Student Signature");

            int index = 1;
            for (SeatingArrangement sa : arrangements) {
                Color bg = (index % 2 == 0) ? ROW_ALT_BG : Color.WHITE;
                Optional<Attendance> att = attendanceRepository.findByExamIdAndStudentId(examId, sa.getStudent().getId());
                String statusStr = att.map(a -> a.getStatus().name()).orElse("PRESENT");

                addTableCell(table, String.valueOf(index++), Element.ALIGN_CENTER, bg);
                addTableCell(table, sa.getStudent().getRegisterNumber(), Element.ALIGN_LEFT, bg, true);
                addTableCell(table, sa.getStudent().getName(), Element.ALIGN_LEFT, bg);
                addTableCell(table, sa.getHall().getHallNumber(), Element.ALIGN_CENTER, bg);
                addTableCell(table, sa.getSeat().getSeatNumber(), Element.ALIGN_CENTER, bg, true);
                addTableCell(table, statusStr, Element.ALIGN_CENTER, bg);
                addTableCell(table, "________________", Element.ALIGN_CENTER, bg);
            }

            if (arrangements.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No candidate seating records found for this register.", CELL_FONT));
                emptyCell.setColspan(7);
                emptyCell.setPadding(12f);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(emptyCell);
            }

            document.add(table);

            // Invigilator signature section
            Paragraph signSection = new Paragraph();
            signSection.setSpacingBefore(24f);
            signSection.add(new Chunk("Invigilator Signature: _______________________      Date: ______________\n\n", CELL_BOLD_FONT));
            signSection.add(new Chunk("Chief Superintendent Signature: _______________________ (Seal)", CELL_BOLD_FONT));
            document.add(signSection);

            addFooter(document);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Attendance Roster PDF: ", e);
            throw new RuntimeException("Could not generate Attendance Roster PDF: " + e.getMessage(), e);
        }
    }

    private void addHeader(Document doc, String title, String subtitle) throws DocumentException {
        Paragraph pTitle = new Paragraph(title, TITLE_FONT);
        pTitle.setAlignment(Element.ALIGN_CENTER);
        doc.add(pTitle);

        Paragraph pSub = new Paragraph(subtitle, SUBTITLE_FONT);
        pSub.setAlignment(Element.ALIGN_CENTER);
        pSub.setSpacingAfter(8f);
        doc.add(pSub);
    }

    private void addInfoCell(PdfPTable table, String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3f);

        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", CELL_BOLD_FONT));
        p.add(new Chunk(value, CELL_FONT));
        cell.addElement(p);
        table.addCell(cell);
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, HEADER_FONT));
            cell.setBackgroundColor(HEADER_BG);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(5f);
            cell.setBorderColor(BORDER_COLOR);
            table.addCell(cell);
        }
    }

    private void addTableCell(PdfPTable table, String text, int align, Color bg) {
        addTableCell(table, text, align, bg, false);
    }

    private void addTableCell(PdfPTable table, String text, int align, Color bg, boolean bold) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", bold ? CELL_BOLD_FONT : CELL_FONT));
        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4.5f);
        cell.setBorderColor(BORDER_COLOR);
        table.addCell(cell);
    }

    @Override
    public byte[] generateAdmitCardPdf(Long examId, Long studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        Optional<SeatingArrangement> saOpt = seatingArrangementRepository.findByExamIdAndStudentId(examId, studentId);

        String hallNum = saOpt.map(sa -> sa.getHall().getHallNumber()).orElse("NOT ALLOCATED");
        String bldg = saOpt.map(sa -> sa.getHall().getBuilding() != null ? sa.getHall().getBuilding() : "Main Block").orElse("-");
        String floor = saOpt.map(sa -> "Floor " + sa.getHall().getFloor()).orElse("-");
        String seatNum = saOpt.map(sa -> sa.getSeat().getSeatNumber()).orElse("PENDING");
        String rowCol = saOpt.map(sa -> "Row " + sa.getSeat().getRowNumber() + ", Col " + sa.getSeat().getColumnNumber()).orElse("-");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Institutional Title & Document Header
            addHeader(document, "CONTROLLER OF EXAMINATIONS • ADMISSION PASS", "OFFICIAL STUDENT HALL TICKET & EXAM PERMIT");

            // Candidate Credentials & QR Code Section Table
            PdfPTable topTable = new PdfPTable(2);
            topTable.setWidthPercentage(100);
            topTable.setWidths(new float[]{3.2f, 1.3f});
            topTable.setSpacingBefore(12f);
            topTable.setSpacingAfter(10f);

            // Left: Student details
            PdfPCell detailsCell = new PdfPCell();
            detailsCell.setBorderColor(BORDER_COLOR);
            detailsCell.setPadding(10f);
            detailsCell.setBackgroundColor(Color.WHITE);

            Paragraph nameP = new Paragraph(student.getName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, PRIMARY_COLOR));
            detailsCell.addElement(nameP);

            Paragraph regP = new Paragraph("Register Number: " + student.getRegisterNumber(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, HEADER_BG));
            regP.setSpacingAfter(6f);
            detailsCell.addElement(regP);

            PdfPTable innerInfo = new PdfPTable(2);
            innerInfo.setWidthPercentage(100);
            addInfoCell(innerInfo, "Department/Branch:", student.getBranch() != null ? student.getBranch() : "-");
            addInfoCell(innerInfo, "Section:", student.getSection() != null ? student.getSection() : "-");
            addInfoCell(innerInfo, "Academic Year:", student.getYear() != null ? "Year " + student.getYear() : "-");
            addInfoCell(innerInfo, "Email:", student.getEmail() != null ? student.getEmail() : "-");
            detailsCell.addElement(innerInfo);

            topTable.addCell(detailsCell);

            // Right: QR Code cell
            PdfPCell qrCell = new PdfPCell();
            qrCell.setBorderColor(BORDER_COLOR);
            qrCell.setBackgroundColor(ROW_ALT_BG);
            qrCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            qrCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            qrCell.setPadding(8f);

            try {
                String qrData = "EXAM-PERMIT:" + student.getRegisterNumber() + "|" + exam.getExamName() + "|HALL:" + hallNum + "|SEAT:" + seatNum;
                com.google.zxing.qrcode.QRCodeWriter qrWriter = new com.google.zxing.qrcode.QRCodeWriter();
                com.google.zxing.common.BitMatrix bitMatrix = qrWriter.encode(qrData, com.google.zxing.BarcodeFormat.QR_CODE, 140, 140);
                java.awt.image.BufferedImage bufferedImage = com.google.zxing.client.j2se.MatrixToImageWriter.toBufferedImage(bitMatrix);
                ByteArrayOutputStream qrBaos = new ByteArrayOutputStream();
                javax.imageio.ImageIO.write(bufferedImage, "png", qrBaos);
                Image qrImg = Image.getInstance(qrBaos.toByteArray());
                qrImg.scaleAbsolute(85f, 85f);
                qrImg.setAlignment(Element.ALIGN_CENTER);
                qrCell.addElement(qrImg);
                Paragraph qrLabel = new Paragraph("SCAN TO VERIFY", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, SECONDARY_COLOR));
                qrLabel.setAlignment(Element.ALIGN_CENTER);
                qrCell.addElement(qrLabel);
            } catch (Exception ex) {
                log.warn("QR code generation failed, using text fallback: {}", ex.getMessage());
                qrCell.addElement(new Paragraph("[SECURE QR CODE]", CELL_BOLD_FONT));
            }

            topTable.addCell(qrCell);
            document.add(topTable);

            // Highlight Box: Seat & Hall Allocation
            PdfPTable seatTable = new PdfPTable(3);
            seatTable.setWidthPercentage(100);
            seatTable.setSpacingBefore(6f);
            seatTable.setSpacingAfter(12f);

            PdfPCell hallCell = new PdfPCell();
            hallCell.setBackgroundColor(new Color(239, 246, 255));
            hallCell.setBorderColor(HEADER_BG);
            hallCell.setPadding(10f);
            hallCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            Paragraph hTitle = new Paragraph("ASSIGNED HALL", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, SECONDARY_COLOR));
            Paragraph hVal = new Paragraph(hallNum, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, HEADER_BG));
            Paragraph hLoc = new Paragraph(bldg + " • " + floor, FontFactory.getFont(FontFactory.HELVETICA, 8, SECONDARY_COLOR));
            hallCell.addElement(hTitle);
            hallCell.addElement(hVal);
            hallCell.addElement(hLoc);
            seatTable.addCell(hallCell);

            PdfPCell deskCell = new PdfPCell();
            deskCell.setBackgroundColor(new Color(240, 253, 244));
            deskCell.setBorderColor(new Color(34, 197, 94));
            deskCell.setPadding(10f);
            deskCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            Paragraph dTitle = new Paragraph("DESK / SEAT NUMBER", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, SECONDARY_COLOR));
            Paragraph dVal = new Paragraph(seatNum, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(22, 101, 52)));
            Paragraph dLoc = new Paragraph(rowCol, FontFactory.getFont(FontFactory.HELVETICA, 8, SECONDARY_COLOR));
            deskCell.addElement(dTitle);
            deskCell.addElement(dVal);
            deskCell.addElement(dLoc);
            seatTable.addCell(deskCell);

            PdfPCell scheduleCell = new PdfPCell();
            scheduleCell.setBackgroundColor(new Color(254, 243, 199));
            scheduleCell.setBorderColor(new Color(245, 158, 11));
            scheduleCell.setPadding(10f);
            Paragraph sTitle = new Paragraph("EXAM SCHEDULE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, SECONDARY_COLOR));
            Paragraph sDate = new Paragraph(exam.getExamDate() != null ? exam.getExamDate().toString() : "-", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, PRIMARY_COLOR));
            Paragraph sTime = new Paragraph(formatTimeSlot(exam), FontFactory.getFont(FontFactory.HELVETICA, 8, PRIMARY_COLOR));
            scheduleCell.addElement(sTitle);
            scheduleCell.addElement(sDate);
            scheduleCell.addElement(sTime);
            seatTable.addCell(scheduleCell);

            document.add(seatTable);

            // Subject / Paper Details Table
            PdfPTable examTable = new PdfPTable(4);
            examTable.setWidthPercentage(100);
            examTable.setWidths(new float[]{1.5f, 3.5f, 2.0f, 2.0f});
            examTable.setSpacingBefore(4f);
            examTable.setSpacingAfter(14f);

            addTableHeader(examTable, "Course Code", "Subject Name", "Exam Session", "Reporting Time");
            addTableCell(examTable, "SUB-" + exam.getId(), Element.ALIGN_CENTER, ROW_ALT_BG, true);
            addTableCell(examTable, exam.getSubject() != null ? exam.getSubject() : exam.getExamName(), Element.ALIGN_LEFT, ROW_ALT_BG);
            addTableCell(examTable, exam.getExamName(), Element.ALIGN_CENTER, ROW_ALT_BG);
            addTableCell(examTable, "30 Mins Prior", Element.ALIGN_CENTER, ROW_ALT_BG, true);

            document.add(examTable);

            // Candidate Instructions Box
            PdfPTable rulesTable = new PdfPTable(1);
            rulesTable.setWidthPercentage(100);
            rulesTable.setSpacingAfter(14f);

            PdfPCell rulesCell = new PdfPCell();
            rulesCell.setBackgroundColor(new Color(248, 250, 252));
            rulesCell.setBorderColor(BORDER_COLOR);
            rulesCell.setPadding(8f);

            Paragraph rulesTitle = new Paragraph("OFFICIAL CANDIDATE CODE OF CONDUCT & INSTRUCTIONS:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, PRIMARY_COLOR));
            rulesTitle.setSpacingAfter(4f);
            rulesCell.addElement(rulesTitle);

            String[] rules = {
                "1. Candidates must produce this official Hall Ticket along with their valid Institution Photo Identity Card.",
                "2. Occupy only your assigned Desk/Seat (" + seatNum + ") in Hall " + hallNum + ". Unauthorized swapping is prohibited.",
                "3. Electronic items, smartwatches, smartphones, and unauthorized notes are strictly prohibited inside the hall.",
                "4. Candidates arriving later than 15 minutes after examination commencement will not be granted entry.",
                "5. Any breach of regulations will result in immediate cancellation of candidature and reporting for malpractice."
            };
            for (String r : rules) {
                Paragraph p = new Paragraph(r, FontFactory.getFont(FontFactory.HELVETICA, 7.5f, SECONDARY_COLOR));
                p.setLeading(9f);
                rulesCell.addElement(p);
            }
            rulesTable.addCell(rulesCell);
            document.add(rulesTable);

            // Signatures Section
            PdfPTable sigTable = new PdfPTable(3);
            sigTable.setWidthPercentage(100);
            sigTable.setSpacingBefore(10f);

            addSignatureCell(sigTable, "Candidate's Signature", "(Sign in presence of invigilator)");
            addSignatureCell(sigTable, "Invigilator's Signature", "(Hall Verification)");
            addSignatureCell(sigTable, "Controller of Examinations", "(Authorized Seal)");

            document.add(sigTable);

            addFooter(document);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Student Admit Card PDF: ", e);
            throw new RuntimeException("Could not generate Admit Card PDF: " + e.getMessage(), e);
        }
    }

    private void addSignatureCell(PdfPTable table, String title, String subtitle) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(4f);

        Paragraph space = new Paragraph("\n\n___________________________", FontFactory.getFont(FontFactory.HELVETICA, 8, SECONDARY_COLOR));
        space.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(space);

        Paragraph t = new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, PRIMARY_COLOR));
        t.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(t);

        Paragraph st = new Paragraph(subtitle, FontFactory.getFont(FontFactory.HELVETICA, 7, SECONDARY_COLOR));
        st.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(st);

        table.addCell(cell);
    }

    private void addFooter(Document doc) throws DocumentException {
        Paragraph footer = new Paragraph("Smart Exam Hall Seating Arrangement System • Auto-Generated Official Document", SUBTITLE_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(16f);
        doc.add(footer);
    }

    private String formatTimeSlot(Exam exam) {
        if (exam.getStartTime() == null && exam.getEndTime() == null) return "-";
        return (exam.getStartTime() != null ? exam.getStartTime().toString() : "")
                + " - " + (exam.getEndTime() != null ? exam.getEndTime().toString() : "");
    }
}
