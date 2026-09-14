package com.exam.seating.repository;

import com.exam.seating.entity.MalpracticeIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<MalpracticeIncident, Long> {

    @Query("SELECT i FROM MalpracticeIncident i " +
           "JOIN FETCH i.exam " +
           "JOIN FETCH i.hall " +
           "JOIN FETCH i.student " +
           "ORDER BY i.reportedAt DESC")
    List<MalpracticeIncident> findAllWithDetails();

    @Query("SELECT i FROM MalpracticeIncident i " +
           "JOIN FETCH i.exam " +
           "JOIN FETCH i.hall " +
           "JOIN FETCH i.student " +
           "WHERE i.exam.id = :examId " +
           "ORDER BY i.reportedAt DESC")
    List<MalpracticeIncident> findByExamId(Long examId);

    @Query("SELECT i FROM MalpracticeIncident i " +
           "JOIN FETCH i.exam " +
           "JOIN FETCH i.hall " +
           "JOIN FETCH i.student " +
           "WHERE i.student.id = :studentId " +
           "ORDER BY i.reportedAt DESC")
    List<MalpracticeIncident> findByStudentId(Long studentId);

    @Query("SELECT i FROM MalpracticeIncident i " +
           "JOIN FETCH i.exam " +
           "JOIN FETCH i.hall " +
           "JOIN FETCH i.student " +
           "WHERE UPPER(i.student.branch) = UPPER(:branch) OR UPPER(i.exam.branch) = UPPER(:branch) " +
           "ORDER BY i.reportedAt DESC")
    List<MalpracticeIncident> findByBranch(@org.springframework.data.repository.query.Param("branch") String branch);
}
