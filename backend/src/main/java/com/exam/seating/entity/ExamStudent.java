package com.exam.seating.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_students",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_exam_student", columnNames = {"exam_id", "student_id"})
        },
        indexes = {
                @Index(name = "idx_exam_students_exam", columnList = "exam_id"),
                @Index(name = "idx_exam_students_student", columnList = "student_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Student student;

    public ExamStudent(Exam exam, Student student) {
        this.exam = exam;
        this.student = student;
    }
}
