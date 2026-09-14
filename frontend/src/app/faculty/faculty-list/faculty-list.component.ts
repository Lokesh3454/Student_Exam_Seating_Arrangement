import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FacultyService } from '../../core/services/faculty.service';
import { Faculty } from '../../core/models/faculty.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-faculty-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationDialogComponent],
  template: `
    <div class="fade-in">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Faculty & Invigilator Directory</h2>
          <p class="text-secondary mb-0 small">Manage faculty invigilation assignments and contact details</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/faculty/assignments" class="btn btn-outline-primary d-flex align-items-center gap-2">
            <i class="bi bi-calendar-check-fill"></i>
            <span>Hall Invigilation Duties</span>
          </a>
          <a routerLink="/faculty/new" class="btn btn-primary shadow-sm d-flex align-items-center gap-2">
            <i class="bi bi-person-plus-fill"></i>
            <span>Add Faculty</span>
          </a>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card border-0 shadow-sm rounded-3 mb-4">
        <div class="card-body p-3">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  class="form-control border-0 bg-light"
                  placeholder="Search by employee ID, name, email..."
                  [(ngModel)]="searchTerm"
                  (input)="filterFaculty()"
                />
              </div>
            </div>
            <div class="col-md-6 text-end">
              <span class="badge bg-light text-secondary border px-3 py-2 fs-7">
                Total Faculty: <strong>{{ filteredFaculty.length }}</strong>
              </span>
            </div>
          </div>
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
        <p class="text-muted mt-2">Loading faculty...</p>
      </div>

      <!-- Faculty Cards Grid -->
      <div *ngIf="!isLoading" class="row g-3">
        <div class="col-md-6 col-lg-4" *ngFor="let member of filteredFaculty">
          <div class="card border-0 shadow-sm rounded-4 h-100 p-3 hover-shadow transition">
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.2rem;">
                {{ member.name.charAt(0) }}
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <h5 class="card-title text-dark fw-bold mb-0 text-truncate">{{ member.name }}</h5>
                <span class="badge bg-light text-primary border border-primary-subtle">{{ member.employeeId }}</span>
              </div>
              <div class="dropdown">
                <div class="btn-group btn-group-sm">
                  <a [routerLink]="['/faculty/edit', member.id]" class="btn btn-outline-light text-secondary" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </a>
                  <button class="btn btn-outline-light text-danger" (click)="promptDelete(member)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="pt-2 border-top text-secondary small">
              <div class="d-flex align-items-center gap-2 mb-1">
                <i class="bi bi-envelope text-primary"></i>
                <span class="text-truncate">{{ member.email }}</span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-telephone text-primary"></i>
                <span>{{ member.phone }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredFaculty.length === 0" class="col-12">
          <div class="card border-0 shadow-sm rounded-4 py-5 text-center text-muted">
            <i class="bi bi-person-badge fs-1 text-secondary opacity-50 d-block mb-2"></i>
            No faculty members found.
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <app-confirmation-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Faculty"
      [message]="'Are you sure you want to delete ' + (facultyToDelete?.name || '') + ' (' + (facultyToDelete?.employeeId || '') + ')?'"
      (confirmed)="confirmDelete()"
      (cancelled)="cancelDelete()"
    ></app-confirmation-dialog>
  `
})
export class FacultyListComponent implements OnInit {
  facultyList: Faculty[] = [];
  filteredFaculty: Faculty[] = [];
  searchTerm = '';
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  isDeleteDialogOpen = false;
  facultyToDelete: Faculty | null = null;

  constructor(private facultyService: FacultyService) {}

  ngOnInit(): void {
    this.loadFaculty();
  }

  loadFaculty(): void {
    this.isLoading = true;
    this.facultyService.getAllFaculty().subscribe({
      next: (res) => {
        this.facultyList = res.data || [];
        this.filterFaculty();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load faculty list.';
        this.isLoading = false;
      }
    });
  }

  filterFaculty(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFaculty = [...this.facultyList];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredFaculty = this.facultyList.filter(f =>
      f.name.toLowerCase().includes(term) ||
      f.employeeId.toLowerCase().includes(term) ||
      f.email.toLowerCase().includes(term)
    );
  }

  promptDelete(faculty: Faculty): void {
    this.facultyToDelete = faculty;
    this.isDeleteDialogOpen = true;
  }

  confirmDelete(): void {
    if (!this.facultyToDelete) return;
    this.facultyService.deleteFaculty(this.facultyToDelete.id).subscribe({
      next: () => {
        this.successMessage = `Faculty ${this.facultyToDelete?.name} deleted successfully.`;
        this.isDeleteDialogOpen = false;
        this.facultyToDelete = null;
        this.loadFaculty();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete faculty member.';
        this.isDeleteDialogOpen = false;
        this.facultyToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.isDeleteDialogOpen = false;
    this.facultyToDelete = null;
  }
}
