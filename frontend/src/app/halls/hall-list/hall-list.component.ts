import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HallService } from '../../core/services/hall.service';
import { Hall } from '../../core/models/hall.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-hall-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationDialogComponent],
  template: `
    <div class="fade-in">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Examination Halls</h2>
          <p class="text-secondary mb-0 small">Configure halls, dimensions, and view interactive seat layout grids</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success shadow-sm d-flex align-items-center gap-2 rounded-pill px-3"
                  (click)="openImportModal()">
            <i class="bi bi-file-earmark-spreadsheet-fill"></i>
            <span>Import Halls CSV</span>
          </button>
          <a routerLink="/halls/new" class="btn btn-primary shadow-sm d-flex align-items-center gap-2 rounded-pill px-3">
            <i class="bi bi-building-add"></i>
            <span>Add Hall</span>
          </a>
        </div>
      </div>

      <!-- Alerts -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-circle-fill"></i>
        <div>{{ errorMessage }}</div>
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-check-circle-fill"></i>
        <div>{{ successMessage }}</div>
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-2">Loading examination halls...</p>
      </div>

      <!-- Hall Cards Grid -->
      <div *ngIf="!isLoading" class="row g-4">
        <div class="col-md-6 col-lg-4" *ngFor="let hall of halls">
          <div class="card border-0 shadow-sm rounded-4 h-100 p-3 hover-shadow transition">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-2 fs-6 mb-2">
                  Hall {{ hall.hallNumber }}
                </span>
                <div class="text-secondary small">
                  <i class="bi bi-geo-alt me-1"></i>{{ hall.building }}, Floor {{ hall.floor }}
                </div>
              </div>
              <div class="btn-group btn-group-sm">
                <a [routerLink]="['/halls/edit', hall.id]" class="btn btn-outline-light text-secondary" title="Edit Hall">
                  <i class="bi bi-pencil"></i>
                </a>
                <button class="btn btn-outline-light text-danger" (click)="promptDelete(hall)" title="Delete Hall">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <div class="p-3 bg-light rounded-3 mb-3">
              <div class="row text-center">
                <div class="col-4 border-end">
                  <div class="text-muted small">Rows</div>
                  <div class="fw-bold fs-5 text-dark">{{ hall.rowsCount }}</div>
                </div>
                <div class="col-4 border-end">
                  <div class="text-muted small">Columns</div>
                  <div class="fw-bold fs-5 text-dark">{{ hall.columnsCount }}</div>
                </div>
                <div class="col-4">
                  <div class="text-muted small">Capacity</div>
                  <div class="fw-bold fs-5 text-success">{{ hall.capacity }}</div>
                </div>
              </div>
            </div>

            <div class="mt-auto pt-2">
              <a [routerLink]="['/halls/view', hall.id]" class="btn btn-outline-primary w-100 rounded-pill d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-grid-3x3-gap-fill"></i>
                <span>View Seat Matrix</span>
              </a>
            </div>
          </div>
        </div>

        <div *ngIf="halls.length === 0" class="col-12">
          <div class="card border-0 shadow-sm rounded-4 py-5 text-center text-muted">
            <i class="bi bi-building-x fs-1 text-secondary opacity-50 d-block mb-2"></i>
            No examination halls configured yet. Click "Add Hall" to register your first hall.
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <app-confirmation-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Examination Hall"
      [message]="'Are you sure you want to delete Hall ' + (hallToDelete?.hallNumber || '') + '? All associated seats and seat arrangements will also be removed.'"
      (confirmed)="confirmDelete()"
      (cancelled)="cancelDelete()"
    ></app-confirmation-dialog>

    <!-- Bulk Import Modal -->
    <div class="modal fade show d-block" *ngIf="isImportModalOpen" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header bg-success text-white p-4">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-spreadsheet-fill"></i> Bulk Import Examination Halls
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeImportModal()"></button>
          </div>
          <div class="modal-body p-4">
            <p class="text-secondary small mb-3">
              Upload a CSV file to mass-create examination halls. All desk and seat arrangements for the grid will be auto-generated automatically!
            </p>

            <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 mb-4">
              <div>
                <strong class="text-dark d-block">Download CSV Format Template</strong>
                <span class="small text-muted">Includes headers: hallNumber, building, floor, rowsCount, columnsCount</span>
              </div>
              <button class="btn btn-sm btn-outline-success rounded-pill px-3" (click)="downloadSampleCsv()">
                <i class="bi bi-download me-1"></i> Sample CSV
              </button>
            </div>

            <!-- File Upload Box -->
            <div class="mb-4">
              <label class="form-label small fw-semibold text-dark">Select CSV File (.csv)</label>
              <input type="file" class="form-control" accept=".csv" (change)="onFileSelected($event)" />
            </div>

            <!-- Import Summary Feedback -->
            <div *ngIf="importSummary" class="alert p-3 rounded-3 mb-0"
                 [ngClass]="importSummary.successfullyImported > 0 ? 'alert-success' : 'alert-danger'">
              <h6 class="fw-bold mb-2">Import Results:</h6>
              <div class="small">Total Rows: <strong>{{ importSummary.totalRows }}</strong></div>
              <div class="small text-success">Successfully Created: <strong>{{ importSummary.successfullyImported }}</strong> halls with seats</div>
              <div class="small text-warning" *ngIf="importSummary.duplicateRows > 0">Duplicates Skipped: <strong>{{ importSummary.duplicateRows }}</strong></div>
              <div class="small text-danger" *ngIf="importSummary.failedRows > 0">Failed Rows: <strong>{{ importSummary.failedRows }}</strong></div>

              <div *ngIf="importSummary.errors && importSummary.errors.length > 0" class="mt-3 pt-2 border-top">
                <strong class="small text-danger d-block mb-1">Row Errors:</strong>
                <ul class="small mb-0 ps-3">
                  <li *ngFor="let err of importSummary.errors">
                    Row {{ err.rowNumber }} ({{ err.hallNumber }}): {{ err.reason }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="modal-footer p-3 bg-light">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="closeImportModal()">Close</button>
            <button type="button" class="btn btn-success rounded-pill px-4 shadow-sm"
                    (click)="uploadCsv()" [disabled]="!selectedFile || isImporting">
              <span *ngIf="isImporting" class="spinner-border spinner-border-sm me-1"></span>
              <span>Upload &amp; Create Halls</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HallListComponent implements OnInit {
  halls: Hall[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  isDeleteDialogOpen = false;
  hallToDelete: Hall | null = null;

  // CSV Import State
  isImportModalOpen = false;
  selectedFile: File | null = null;
  isImporting = false;
  importSummary: any = null;

  constructor(private hallService: HallService) {}

  ngOnInit(): void {
    this.loadHalls();
  }

  loadHalls(): void {
    this.isLoading = true;
    this.hallService.getAllHalls().subscribe({
      next: (res) => {
        this.halls = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load examination halls.';
        this.isLoading = false;
      }
    });
  }

  openImportModal(): void {
    this.isImportModalOpen = true;
    this.selectedFile = null;
    this.importSummary = null;
  }

  closeImportModal(): void {
    this.isImportModalOpen = false;
    this.selectedFile = null;
    this.importSummary = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadCsv(): void {
    if (!this.selectedFile) return;

    this.isImporting = true;
    this.importSummary = null;

    this.hallService.importHalls(this.selectedFile).subscribe({
      next: (res) => {
        this.importSummary = res.data;
        this.isImporting = false;
        if (this.importSummary.successfullyImported > 0) {
          this.successMessage = `Successfully imported ${this.importSummary.successfullyImported} halls with seats.`;
          this.loadHalls();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Hall CSV Import failed. Check formatting.';
        this.isImporting = false;
      }
    });
  }

  downloadSampleCsv(): void {
    const csvContent = 'hallNumber,building,floor,rowsCount,columnsCount\n' +
      'LH-301,Science Block,3,4,4\n' +
      'LH-302,Science Block,3,5,4\n' +
      'LH-401,Technology Block,4,6,6\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_halls_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  promptDelete(hall: Hall): void {
    this.hallToDelete = hall;
    this.isDeleteDialogOpen = true;
  }

  confirmDelete(): void {
    if (!this.hallToDelete) return;
    this.hallService.deleteHall(this.hallToDelete.id).subscribe({
      next: () => {
        this.successMessage = `Hall ${this.hallToDelete?.hallNumber} deleted successfully.`;
        this.isDeleteDialogOpen = false;
        this.hallToDelete = null;
        this.loadHalls();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete hall.';
        this.isDeleteDialogOpen = false;
        this.hallToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.isDeleteDialogOpen = false;
    this.hallToDelete = null;
  }
}
