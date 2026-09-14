import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FacultyService } from '../../core/services/faculty.service';
import { FacultyRequest } from '../../core/models/faculty.model';

@Component({
  selector: 'app-faculty-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in">
      <div class="mb-4">
        <a routerLink="/faculty" class="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2">
          <i class="bi bi-arrow-left"></i> Back to Faculty List
        </a>
        <h2 class="h4 fw-bold text-dark mb-1">{{ isEditMode ? 'Edit Faculty Details' : 'Add New Faculty' }}</h2>
        <p class="text-secondary small mb-0">{{ isEditMode ? 'Update faculty contact and department details' : 'Register a new faculty or invigilator' }}</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div class="card border-0 shadow-sm rounded-4 p-4">
        <form #facultyForm="ngForm" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Employee ID <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                name="employeeId"
                [(ngModel)]="faculty.employeeId"
                placeholder="e.g. FAC001"
                required
                [disabled]="isEditMode"
              />
              <small class="text-muted" *ngIf="isEditMode">Employee ID cannot be changed once created.</small>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Full Name <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                name="name"
                [(ngModel)]="faculty.name"
                placeholder="e.g. Dr. Rajesh Kumar"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Email Address <span class="text-danger">*</span></label>
              <input
                type="email"
                class="form-control"
                name="email"
                [(ngModel)]="faculty.email"
                placeholder="e.g. rajesh@university.edu"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Phone Number <span class="text-danger">*</span></label>
              <input
                type="tel"
                class="form-control"
                name="phone"
                [(ngModel)]="faculty.phone"
                placeholder="e.g. 9876543210"
                required
              />
            </div>

            <div class="col-12 mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
              <a routerLink="/faculty" class="btn btn-light rounded-pill px-4">Cancel</a>
              <button
                type="submit"
                class="btn btn-primary rounded-pill px-4"
                [disabled]="!facultyForm.form.valid || isSubmitting"
              >
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                {{ isEditMode ? 'Update Faculty' : 'Save Faculty' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class FacultyFormComponent implements OnInit {
  isEditMode = false;
  facultyId: number | null = null;
  isSubmitting = false;
  errorMessage = '';

  faculty: FacultyRequest = {
    employeeId: '',
    name: '',
    email: '',
    phone: ''
  };

  constructor(
    private facultyService: FacultyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.isEditMode = true;
      this.facultyId = Number(idParam);
      this.loadFaculty(this.facultyId);
    }
  }

  loadFaculty(id: number): void {
    this.facultyService.getFacultyById(id).subscribe({
      next: (res) => {
        if (res.data) {
          const f = res.data;
          this.faculty = {
            employeeId: f.employeeId,
            name: f.name,
            email: f.email,
            phone: f.phone
          };
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load faculty details.';
      }
    });
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.isEditMode && this.facultyId) {
      this.facultyService.updateFaculty(this.facultyId, this.faculty).subscribe({
        next: () => {
          this.router.navigate(['/faculty']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update faculty.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.facultyService.createFaculty(this.faculty).subscribe({
        next: () => {
          this.router.navigate(['/faculty']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to create faculty.';
          this.isSubmitting = false;
        }
      });
    }
  }
}
