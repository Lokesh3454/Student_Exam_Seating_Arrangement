import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HallService } from '../../core/services/hall.service';
import { SeatService } from '../../core/services/seat.service';
import { Hall } from '../../core/models/hall.model';
import { Seat, SeatStatus } from '../../core/models/seat.model';

interface SeatRowGroup {
  rowNumber: number;
  seats: Seat[];
}

@Component({
  selector: 'app-hall-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="fade-in">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <a routerLink="/halls" class="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2">
            <i class="bi bi-arrow-left"></i> Back to Halls
          </a>
          <h2 class="h4 fw-bold text-dark mb-1">
            Hall {{ hall?.hallNumber }} - Seat Layout Matrix
          </h2>
          <p class="text-secondary small mb-0">
            {{ hall?.building }}, Floor {{ hall?.floor }} | {{ hall?.rowsCount }} Rows × {{ hall?.columnsCount }} Columns (Total Capacity: {{ hall?.capacity }} seats)
          </p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary d-flex align-items-center gap-2" (click)="printLayout()">
            <i class="bi bi-printer"></i>
            <span>Print Layout</span>
          </button>
          <a [routerLink]="['/halls/edit', hall?.id]" class="btn btn-outline-primary d-flex align-items-center gap-2">
            <i class="bi bi-pencil"></i>
            <span>Edit Hall</span>
          </a>
        </div>
      </div>

      <!-- Alerts -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <!-- Seat Status Legend -->
      <div class="card border-0 shadow-sm rounded-3 mb-4">
        <div class="card-body p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div class="d-flex flex-wrap align-items-center gap-4">
            <div class="d-flex align-items-center gap-2">
              <span class="seat-sample bg-success-subtle border border-success text-success"></span>
              <span class="small fw-semibold">Available ({{ availableCount }})</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="seat-sample bg-primary-subtle border border-primary text-primary"></span>
              <span class="small fw-semibold">Occupied ({{ occupiedCount }})</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="seat-sample bg-warning-subtle border border-warning text-warning-emphasis"></span>
              <span class="small fw-semibold">Maintenance / Broken ({{ maintenanceCount }})</span>
            </div>
          </div>
          <span class="text-muted small">
            <i class="bi bi-cursor-fill me-1"></i> Click any seat to toggle its maintenance status
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-2">Rendering hall seat matrix...</p>
      </div>

      <!-- Visual Hall Seating Grid -->
      <div *ngIf="!isLoading" class="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <!-- Blackboard / Screen Area -->
        <div class="text-center mb-5">
          <div class="d-inline-block px-5 py-2 bg-dark text-white rounded-3 shadow-sm fw-semibold letter-spacing-1">
            <i class="bi bi-display me-2"></i> FRONT / TEACHER'S DESK / BLACKBOARD
          </div>
        </div>

        <!-- Seats Rows Container -->
        <div class="d-flex flex-column gap-3 overflow-auto pb-3">
          <div *ngFor="let row of rowGroups" class="d-flex align-items-center gap-3 justify-content-center">
            <!-- Row Label -->
            <span class="badge bg-secondary-subtle text-secondary px-2 py-2 fw-bold text-nowrap" style="width: 60px;">
              Row {{ row.rowNumber }}
            </span>

            <!-- Seats in this Row -->
            <div class="d-flex gap-2 flex-nowrap">
              <div
                *ngFor="let seat of row.seats"
                class="seat-box cursor-pointer position-relative d-flex flex-column align-items-center justify-content-center rounded-3 p-2 transition"
                [ngClass]="getSeatClasses(seat)"
                (click)="toggleSeatStatus(seat)"
                [title]="'Seat ' + seat.seatNumber + ' (Status: ' + seat.status + ')'"
              >
                <i class="bi" [ngClass]="getSeatIcon(seat)"></i>
                <span class="fw-bold mt-1 font-monospace" style="font-size: 0.75rem;">{{ seat.seatNumber }}</span>
                <span class="seat-pos-text text-muted" style="font-size: 0.65rem;">R{{ seat.rowNumber }}C{{ seat.columnNumber }}</span>
              </div>
            </div>

            <!-- Trailing Row Label for symmetrical reading -->
            <span class="badge bg-secondary-subtle text-secondary px-2 py-2 fw-bold text-nowrap" style="width: 60px;">
              Row {{ row.rowNumber }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seat-sample {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      display: inline-block;
    }
    .seat-box {
      width: 58px;
      height: 58px;
      border: 2px solid;
      user-select: none;
    }
    .seat-box:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
    }
    .seat-available {
      background-color: #ecfdf5;
      border-color: #10b981;
      color: #065f46;
    }
    .seat-occupied {
      background-color: #eff6ff;
      border-color: #3b82f6;
      color: #1e40af;
    }
    .seat-maintenance {
      background-color: #fffbeb;
      border-color: #f59e0b;
      color: #b45309;
    }
    .letter-spacing-1 {
      letter-spacing: 2px;
    }
    .cursor-pointer {
      cursor: pointer;
    }
  `]
})
export class HallViewComponent implements OnInit {
  hallId!: number;
  hall: Hall | null = null;
  seats: Seat[] = [];
  rowGroups: SeatRowGroup[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  availableCount = 0;
  occupiedCount = 0;
  maintenanceCount = 0;

  constructor(
    private route: ActivatedRoute,
    private hallService: HallService,
    private seatService: SeatService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.hallId = Number(idParam);
      this.loadHallAndSeats();
    }
  }

  loadHallAndSeats(): void {
    this.isLoading = true;
    this.hallService.getHallById(this.hallId).subscribe({
      next: (hallRes) => {
        this.hall = hallRes.data || null;
        this.loadSeats();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load hall information.';
        this.isLoading = false;
      }
    });
  }

  loadSeats(): void {
    this.seatService.getSeatsByHallId(this.hallId).subscribe({
      next: (seatsRes) => {
        this.seats = seatsRes.data || [];
        this.calculateStats();
        this.buildRowGroups();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load seats for this hall.';
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.availableCount = this.seats.filter(s => s.status === 'AVAILABLE').length;
    this.occupiedCount = this.seats.filter(s => s.status === 'OCCUPIED').length;
    this.maintenanceCount = this.seats.filter(s => s.status === 'MAINTENANCE').length;
  }

  buildRowGroups(): void {
    const map = new Map<number, Seat[]>();
    this.seats.forEach(s => {
      const r = s.rowNumber;
      if (!map.has(r)) {
        map.set(r, []);
      }
      map.get(r)!.push(s);
    });

    const groups: SeatRowGroup[] = [];
    const sortedRows = Array.from(map.keys()).sort((a, b) => a - b);
    sortedRows.forEach(r => {
      const seatsInRow = map.get(r)!.sort((a, b) => a.columnNumber - b.columnNumber);
      groups.push({ rowNumber: r, seats: seatsInRow });
    });
    this.rowGroups = groups;
  }

  getSeatClasses(seat: Seat): string {
    switch (seat.status) {
      case 'AVAILABLE':
        return 'seat-available';
      case 'OCCUPIED':
        return 'seat-occupied';
      case 'MAINTENANCE':
        return 'seat-maintenance';
      default:
        return 'bg-light border-secondary text-secondary';
    }
  }

  getSeatIcon(seat: Seat): string {
    switch (seat.status) {
      case 'AVAILABLE':
        return 'bi-check-circle-fill text-success';
      case 'OCCUPIED':
        return 'bi-person-fill text-primary';
      case 'MAINTENANCE':
        return 'bi-tools text-warning';
      default:
        return 'bi-question-circle';
    }
  }

  toggleSeatStatus(seat: Seat): void {
    if (seat.status === 'OCCUPIED') {
      alert(`Seat ${seat.seatNumber} is currently occupied by an active exam seating assignment. To reassign, modify the seating arrangement.`);
      return;
    }

    const nextStatus: SeatStatus = seat.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    this.seatService.updateSeatStatus(seat.id, nextStatus).subscribe({
      next: (res) => {
        seat.status = nextStatus;
        this.calculateStats();
        this.successMessage = `Seat ${seat.seatNumber} status updated to ${nextStatus}.`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update seat status.';
      }
    });
  }

  printLayout(): void {
    window.print();
  }
}
