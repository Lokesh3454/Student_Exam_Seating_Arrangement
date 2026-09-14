package com.exam.seating.repository;

import com.exam.seating.entity.FacultyAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyAssignmentRepository extends JpaRepository<FacultyAssignment, Long> {

    List<FacultyAssignment> findByFacultyId(Long facultyId);

    List<FacultyAssignment> findByExamId(Long examId);

    List<FacultyAssignment> findByHallId(Long hallId);

    List<FacultyAssignment> findByExamIdAndHallId(Long examId, Long hallId);

    List<FacultyAssignment> findByFaculty_User_Id(Long userId);

    Optional<FacultyAssignment> findByExamIdAndHallIdAndFacultyId(Long examId, Long hallId, Long facultyId);

    Boolean existsByExamIdAndHallIdAndFacultyId(Long examId, Long hallId, Long facultyId);

    Boolean existsByExamIdAndFacultyIdAndHallIdNot(Long examId, Long facultyId, Long hallId);

    long countByFaculty_User_Id(Long userId);

    void deleteByExamId(Long examId);
}
