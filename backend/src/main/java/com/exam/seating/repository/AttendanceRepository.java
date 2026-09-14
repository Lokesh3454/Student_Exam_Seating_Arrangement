package com.exam.seating.repository;

import com.exam.seating.entity.Attendance;
import com.exam.seating.entity.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByExamId(Long examId);

    List<Attendance> findByExamIdAndHallId(Long examId, Long hallId);

    Optional<Attendance> findByExamIdAndStudentId(Long examId, Long studentId);

    List<Attendance> findByExamIdAndStatus(Long examId, AttendanceStatus status);

    Boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    long countByExamIdAndStatus(Long examId, AttendanceStatus status);

    void deleteByExamId(Long examId);
}
