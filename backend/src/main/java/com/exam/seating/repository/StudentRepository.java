package com.exam.seating.repository;

import com.exam.seating.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRegisterNumber(String registerNumber);

    Boolean existsByRegisterNumber(String registerNumber);

    Boolean existsByEmail(String email);

    Optional<Student> findByEmail(String email);

    List<Student> findByBranch(String branch);

    List<Student> findByBranchAndYear(String branch, Integer year);

    List<Student> findByYear(Integer year);

    Optional<Student> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.registerNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.branch) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Student> searchStudents(@org.springframework.data.repository.query.Param("keyword") String keyword);
}
