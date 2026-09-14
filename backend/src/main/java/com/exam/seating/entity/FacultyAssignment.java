package com.exam.seating.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_assignments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_faculty_exam_hall", columnNames = {"exam_id", "hall_id", "faculty_id"})
        },
        indexes = {
                @Index(name = "idx_assignment_exam", columnList = "exam_id"),
                @Index(name = "idx_assignment_faculty", columnList = "faculty_id"),
                @Index(name = "idx_assignment_hall", columnList = "hall_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "faculty_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Faculty faculty;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hall_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Hall hall;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;

    public FacultyAssignment(Faculty faculty, Exam exam, Hall hall) {
        this.faculty = faculty;
        this.exam = exam;
        this.hall = hall;
    }
}
