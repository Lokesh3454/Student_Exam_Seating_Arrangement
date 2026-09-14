package com.exam.seating.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "students", indexes = {
        @Index(name = "idx_students_reg_no", columnList = "register_number"),
        @Index(name = "idx_students_branch_year", columnList = "branch, year")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "register_number", nullable = false, unique = true, length = 50)
    private String registerNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String branch;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false, length = 10)
    private String section;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Student(String registerNumber, String name, String branch, Integer year, String section, String email, String phone) {
        this.registerNumber = registerNumber;
        this.name = name;
        this.branch = branch;
        this.year = year;
        this.section = section;
        this.email = email;
        this.phone = phone;
    }
}
