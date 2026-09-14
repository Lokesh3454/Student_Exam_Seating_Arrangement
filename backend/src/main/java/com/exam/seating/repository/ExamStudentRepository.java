package com.exam.seating.repository;

import com.exam.seating.entity.ExamStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamStudentRepository extends JpaRepository<ExamStudent, Long> {

    List<ExamStudent> findByExamId(Long examId);

    @org.springframework.data.jpa.repository.Query("SELECT es FROM ExamStudent es JOIN FETCH es.student WHERE es.exam.id = :examId")
    List<ExamStudent> findByExamIdWithStudent(@org.springframework.data.repository.query.Param("examId") Long examId);

    List<ExamStudent> findByStudentId(Long studentId);

    Optional<ExamStudent> findByExamIdAndStudentId(Long examId, Long studentId);

    Boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    long countByExamId(Long examId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM ExamStudent es WHERE es.exam.id = :examId AND es.student.id = :studentId")
    void deleteByExamIdAndStudentId(@org.springframework.data.repository.query.Param("examId") Long examId, @org.springframework.data.repository.query.Param("studentId") Long studentId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM ExamStudent es WHERE es.exam.id = :examId")
    void deleteByExamId(@org.springframework.data.repository.query.Param("examId") Long examId);
}
