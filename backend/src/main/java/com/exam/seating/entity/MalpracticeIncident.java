package com.exam.seating.entity;

import com.exam.seating.entity.enums.IncidentStatus;
import com.exam.seating.entity.enums.IncidentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "malpractice_incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MalpracticeIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hall_id", nullable = false)
    private Hall hall;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 100)
    private String reportedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private IncidentType incidentType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(length = 255)
    private String confiscatedItems;

    @Column(length = 255)
    private String actionTaken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.REPORTED;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime reportedAt;
}
