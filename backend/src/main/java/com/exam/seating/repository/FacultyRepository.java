package com.exam.seating.repository;

import com.exam.seating.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByEmployeeId(String employeeId);

    Boolean existsByEmployeeId(String employeeId);

    Boolean existsByEmail(String email);

    Optional<Faculty> findByEmail(String email);

    Optional<Faculty> findByUserId(Long userId);
}
