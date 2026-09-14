import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HallService } from '../../core/services/hall.service';
import { HallRequest } from '../../core/models/hall.model';

@Component({
  selector: 'app-hall-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in">
      <div class="mb-4">
        <a routerLink="/halls" class="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2">
          <i class="bi bi-arrow-left"></i> Back to Halls
        </a>
        <h2 class="h4 fw-bold text-dark mb-1">{{ isEditMode ? 'Edit Examination Hall' : 'Create New Examination Hall' }}</h2>
        <p class="text-secondary small mb-0">{{ isEditMode ? 'Update hall dimensions and location' : 'Specify hall dimensions; seats will be generated automatically' }}</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div class="row g-4">
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <form #hallForm="ngForm" (ngSubmit)="onSubmit()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">Hall Number / Code <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    name="hallNumber"
                    [(ngModel)]="hall.hallNumber"
                    placeholder="e.g. LH-101"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">Building Name <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    name="building"
                    [(ngModel)]="hall.building"
                    placeholder="e.g. Academic Block A"
                    required
                  />
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold text-dark">Floor <span class="text-danger">*</span></label>
                  <input
                    type="number"
                    class="form-control"
                    name="floor"
                    [(ngModel)]="hall.floor"
                    min="0"
                    max="20"
                    required
                  />
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold text-dark">Number of Rows <span class="text-danger">*</span></label>
                  <input
                    type="number"
                    class="form-control"
                    name="rowsCount"
                    [(ngModel)]="hall.rowsCount"
                    min="1"
                    max="50"
                    required
                  />
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold text-dark">Columns per Row <span class="text-danger">*</span></label>
                  <input
                    type="number"
                    class="form-control"
                    name="columnsCount"
                    [(ngModel)]="hall.columnsCount"
                    min="1"
                    max="50"
                    required
                  />
                </div>

                <div class="col-12 mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
                  <a routerLink="/halls" class="btn btn-light rounded-pill px-4">Cancel</a>
                  <button
                    type="submit"
                    class="btn btn-primary rounded-pill px-4"
                    [disabled]="!hallForm.form.valid || isSubmitting"
                  >
                    <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    {{ isEditMode ? 'Update Hall' : 'Create Hall & Generate Seats' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Live Capacity & Grid Preview -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-light">
            <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-calculator text-primary"></i> Hall Capacity Preview
            </h5>
            <div class="p-3 bg-white rounded-3 shadow-sm mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-secondary">Rows × Columns</span>
                <span class="fw-semibold">{{ hall.rowsCount || 0 }} × {{ hall.columnsCount || 0 }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-secondary">Calculated Total Seats</span>
                <span class="fs-4 fw-bold text-primary">{{ (hall.rowsCount || 0) * (hall.columnsCount || 0) }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-secondary">Building & Floor</span>
                <span class="fw-semibold">{{ hall.building || '-' }}, Floor {{ hall.floor || 0 }}</span>
              </div>
            </div>

            <div class="alert alert-info border-0 rounded-3 small mb-0">
              <i class="bi bi-info-circle-fill me-1"></i>
              When created, seats will automatically be generated in row-major order (e.g., A1, A2... or R1-C1). All seats will initially be set to AVAILABLE.
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HallFormComponent implements OnInit {
  isEditMode = false;
  hallId: number | null = null;
  isSubmitting = false;
  errorMessage = '';

  hall: HallRequest = {
    hallNumber: '',
    building: '',
    floor: 1,
    rowsCount: 5,
    columnsCount: 3
  };

  constructor(
    private hallService: HallService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.isEditMode = true;
      this.hallId = Number(idParam);
      this.loadHall(this.hallId);
    }
  }

  loadHall(id: number): void {
    this.hallService.getHallById(id).subscribe({
      next: (res) => {
        if (res.data) {
          const h = res.data;
          this.hall = {
            hallNumber: h.hallNumber,
            building: h.building,
            floor: h.floor,
            rowsCount: h.rowsCount,
            columnsCount: h.columnsCount
          };
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load hall details.';
      }
    });
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.isEditMode && this.hallId) {
      this.hallService.updateHall(this.hallId, this.hall).subscribe({
        next: () => {
          this.router.navigate(['/halls']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update hall.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.hallService.createHall(this.hall).subscribe({
        next: () => {
          this.router.navigate(['/halls']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to create hall.';
          this.isSubmitting = false;
        }
      });
    }
  }
}
