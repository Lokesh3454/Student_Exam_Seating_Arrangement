package com.exam.seating.repository;

import com.exam.seating.entity.Exam;
import com.exam.seating.entity.enums.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByExamDate(LocalDate examDate);

    List<Exam> findByExamDateAndStartTimeAndEndTime(LocalDate examDate, java.time.LocalTime startTime, java.time.LocalTime endTime);

    List<Exam> findByStatus(ExamStatus status);

    List<Exam> findByExamDateGreaterThanEqualOrderByExamDateAsc(LocalDate date);

    List<Exam> findBySubjectContainingIgnoreCase(String subject);

    List<Exam> findByBranch(String branch);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Exam e LEFT JOIN FETCH e.allottedHalls WHERE e.id = :id")
    java.util.Optional<Exam> findByIdWithHalls(@org.springframework.data.repository.query.Param("id") Long id);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT e FROM Exam e LEFT JOIN FETCH e.allottedHalls ORDER BY e.examDate ASC")
    List<Exam> findAllWithHalls();
}
