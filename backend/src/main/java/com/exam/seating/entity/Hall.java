package com.exam.seating.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "halls", indexes = {
        @Index(name = "idx_halls_number", columnList = "hall_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hall_number", nullable = false, unique = true, length = 50)
    private String hallNumber;

    @Column(nullable = false, length = 100)
    private String building;

    @Column(nullable = false)
    private Integer floor;

    @Column(name = "rows_count", nullable = false)
    private Integer rowsCount;

    @Column(name = "columns_count", nullable = false)
    private Integer columnsCount;

    @Column(nullable = false)
    private Integer capacity;

    @OneToMany(mappedBy = "hall", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<Seat> seats = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Hall(String hallNumber, String building, Integer floor, Integer rowsCount, Integer columnsCount, Integer capacity) {
        this.hallNumber = hallNumber;
        this.building = building;
        this.floor = floor;
        this.rowsCount = rowsCount;
        this.columnsCount = columnsCount;
        this.capacity = capacity;
    }

    public void addSeat(Seat seat) {
        seats.add(seat);
        seat.setHall(this);
    }

    public void removeSeat(Seat seat) {
        seats.remove(seat);
        seat.setHall(null);
    }
}
