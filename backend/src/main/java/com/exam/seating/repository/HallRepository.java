package com.exam.seating.repository;

import com.exam.seating.entity.Hall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HallRepository extends JpaRepository<Hall, Long> {

    Optional<Hall> findByHallNumber(String hallNumber);

    Boolean existsByHallNumber(String hallNumber);

    List<Hall> findByBuilding(String building);

    List<Hall> findByCapacityGreaterThanEqual(Integer minCapacity);
}
