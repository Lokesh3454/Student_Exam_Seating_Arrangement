package com.exam.seating.entity;

import com.exam.seating.entity.enums.ExamStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "exams", indexes = {
        @Index(name = "idx_exams_date", columnList = "exam_date"),
        @Index(name = "idx_exams_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_name", nullable = false, length = 100)
    private String examName;

    @Column(nullable = false, length = 100)
    private String subject;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ExamStatus status = ExamStatus.SCHEDULED;

    @Column(name = "branch", length = 50, nullable = false)
    @Builder.Default
    private String branch = "ALL";

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "exam_halls",
            joinColumns = @JoinColumn(name = "exam_id"),
            inverseJoinColumns = @JoinColumn(name = "hall_id")
    )
    @Builder.Default
    private java.util.Set<Hall> allottedHalls = new java.util.HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Exam(String examName, String subject, LocalDate examDate, LocalTime startTime, LocalTime endTime) {
        this.examName = examName;
        this.subject = subject;
        this.examDate = examDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = ExamStatus.SCHEDULED;
        this.branch = "ALL";
        this.allottedHalls = new java.util.HashSet<>();
    }
}
