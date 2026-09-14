package com.exam.seating.repository;

import com.exam.seating.entity.Seat;
import com.exam.seating.entity.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByHallId(Long hallId);

    List<Seat> findByHallIdOrderByRowNumberAscColumnNumberAsc(Long hallId);

    List<Seat> findByHallIdAndStatus(Long hallId, SeatStatus status);

    Optional<Seat> findByHallIdAndSeatNumber(Long hallId, String seatNumber);

    Optional<Seat> findByHallIdAndRowNumberAndColumnNumber(Long hallId, Integer rowNumber, Integer columnNumber);

    long countByHallId(Long hallId);

    long countByHallIdAndStatus(Long hallId, SeatStatus status);

    long countByStatus(SeatStatus status);

    List<Seat> findByHallIdInAndStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(List<Long> hallIds, SeatStatus status);

    List<Seat> findByStatusOrderByHallIdAscRowNumberAscColumnNumberAsc(SeatStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Seat s WHERE s.hall.id = :hallId")
    void deleteByHallId(@org.springframework.data.repository.query.Param("hallId") Long hallId);
}
