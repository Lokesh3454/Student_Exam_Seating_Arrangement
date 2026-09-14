package com.exam.seating.entity;

import com.exam.seating.entity.enums.SeatStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_seat_hall_grid", columnNames = {"hall_id", "row_number", "column_number"}),
                @UniqueConstraint(name = "uk_seat_hall_number", columnNames = {"hall_id", "seat_number"})
        },
        indexes = {
                @Index(name = "idx_seats_hall", columnList = "hall_id"),
                @Index(name = "idx_seats_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hall_id", nullable = false)
    @JsonIgnoreProperties({"seats", "hibernateLazyInitializer", "handler"})
    private Hall hall;

    @Column(name = "`row_number`", nullable = false)
    private Integer rowNumber;

    @Column(name = "`column_number`", nullable = false)
    private Integer columnNumber;

    @Column(name = "seat_number", nullable = false, length = 20)
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SeatStatus status = SeatStatus.AVAILABLE;

    public Seat(Hall hall, Integer rowNumber, Integer columnNumber, String seatNumber) {
        this.hall = hall;
        this.rowNumber = rowNumber;
        this.columnNumber = columnNumber;
        this.seatNumber = seatNumber;
        this.status = SeatStatus.AVAILABLE;
    }
}
