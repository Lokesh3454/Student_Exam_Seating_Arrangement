package com.exam.seating.entity;

import com.exam.seating.entity.enums.AttendanceStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_attendance_exam_student", columnNames = {"exam_id", "student_id"})
        },
        indexes = {
                @Index(name = "idx_attendance_exam", columnList = "exam_id"),
                @Index(name = "idx_attendance_student", columnList = "student_id"),
                @Index(name = "idx_attendance_hall", columnList = "hall_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.ABSENT;

    @UpdateTimestamp
    @Column(name = "marked_at")
    private LocalDateTime markedAt;

    public Attendance(Exam exam, Student student, Hall hall, AttendanceStatus status) {
        this.exam = exam;
        this.student = student;
        this.hall = hall;
        this.status = status;
    }
}
