package com.exam.seating.repository;

import com.exam.seating.entity.SeatingArrangement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatingArrangementRepository extends JpaRepository<SeatingArrangement, Long> {

    List<SeatingArrangement> findByExamId(Long examId);

    @Query("SELECT sa FROM SeatingArrangement sa " +
           "JOIN FETCH sa.student s " +
           "JOIN FETCH sa.hall h " +
           "JOIN FETCH sa.seat st " +
           "JOIN FETCH sa.exam e " +
           "WHERE e.id = :examId " +
           "ORDER BY h.hallNumber ASC, st.rowNumber ASC, st.columnNumber ASC")
    List<SeatingArrangement> findFullArrangementByExamId(@Param("examId") Long examId);

    List<SeatingArrangement> findByExamIdAndHallId(Long examId, Long hallId);

    Optional<SeatingArrangement> findByExamIdAndStudentId(Long examId, Long studentId);

    @Query("SELECT sa FROM SeatingArrangement sa " +
           "JOIN FETCH sa.student s " +
           "JOIN FETCH sa.hall h " +
           "JOIN FETCH sa.seat st " +
           "JOIN FETCH sa.exam e " +
           "WHERE e.id = :examId AND s.registerNumber = :registerNumber")
    Optional<SeatingArrangement> findByExamIdAndStudentRegisterNumber(
            @Param("examId") Long examId,
            @Param("registerNumber") String registerNumber
    );

    @Query("SELECT sa FROM SeatingArrangement sa " +
           "JOIN FETCH sa.student s " +
           "JOIN FETCH sa.hall h " +
           "JOIN FETCH sa.seat st " +
           "WHERE sa.exam.id = :examId AND sa.hall.id = :hallId " +
           "ORDER BY st.rowNumber ASC, st.columnNumber ASC")
    List<SeatingArrangement> findArrangementDetailsByExamAndHall(
            @Param("examId") Long examId,
            @Param("hallId") Long hallId
    );

    Boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    Boolean existsByExamIdAndSeatId(Long examId, Long seatId);

    long countByExamId(Long examId);

    long countByExamIdAndHallId(Long examId, Long hallId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM SeatingArrangement sa WHERE sa.exam.id = :examId")
    void deleteByExamId(@Param("examId") Long examId);
}
