package com.exam.seating.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "seating_arrangements",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_arrangement_exam_student", columnNames = {"exam_id", "student_id"}),
                @UniqueConstraint(name = "uk_arrangement_exam_seat", columnNames = {"exam_id", "seat_id"})
        },
        indexes = {
                @Index(name = "idx_arrangement_exam", columnList = "exam_id"),
                @Index(name = "idx_arrangement_student", columnList = "student_id"),
                @Index(name = "idx_arrangement_hall", columnList = "hall_id"),
                @Index(name = "idx_arrangement_seat", columnList = "seat_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatingArrangement {

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hall_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Hall hall;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seat_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Seat seat;

    @CreationTimestamp
    @Column(name = "arrangement_date", updatable = false)
    private LocalDateTime arrangementDate;

    public SeatingArrangement(Exam exam, Student student, Hall hall, Seat seat) {
        this.exam = exam;
        this.student = student;
        this.hall = hall;
        this.seat = seat;
    }
}
