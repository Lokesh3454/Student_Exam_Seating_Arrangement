import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../core/services/student.service';
import { StudentRequest } from '../../core/models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in">
      <div class="mb-4">
        <a routerLink="/students" class="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2">
          <i class="bi bi-arrow-left"></i> Back to Student List
        </a>
        <h2 class="h4 fw-bold text-dark mb-1">{{ isEditMode ? 'Edit Student Details' : 'Register New Student' }}</h2>
        <p class="text-secondary small mb-0">{{ isEditMode ? 'Update student academic and contact details' : 'Enter the student details to register them in the examination system' }}</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div class="card border-0 shadow-sm rounded-4 p-4">
        <form #studentForm="ngForm" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Register Number <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                name="registerNumber"
                [(ngModel)]="student.registerNumber"
                placeholder="e.g. 21CS001"
                required
                [disabled]="isEditMode"
              />
              <small class="text-muted" *ngIf="isEditMode">Register number cannot be changed once created.</small>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Full Name <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                name="name"
                [(ngModel)]="student.name"
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold text-dark">Branch / Department <span class="text-danger">*</span></label>
              <select class="form-select" name="branch" [(ngModel)]="student.branch" required>
                <option value="" disabled>Select Branch</option>
                <option value="CSE">Computer Science and Engineering (CSE)</option>
                <option value="ECE">Electronics and Communication (ECE)</option>
                <option value="MECH">Mechanical Engineering (MECH)</option>
                <option value="CIVIL">Civil Engineering (CIVIL)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="EEE">Electrical & Electronics (EEE)</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold text-dark">Year <span class="text-danger">*</span></label>
              <select class="form-select" name="year" [(ngModel)]="student.year" required>
                <option [value]="1">1st Year</option>
                <option [value]="2">2nd Year</option>
                <option [value]="3">3rd Year</option>
                <option [value]="4">4th Year</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold text-dark">Section <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                name="section"
                [(ngModel)]="student.section"
                placeholder="e.g. A, B, C"
                required
                maxlength="2"
              />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Email Address <span class="text-danger">*</span></label>
              <input
                type="email"
                class="form-control"
                name="email"
                [(ngModel)]="student.email"
                placeholder="e.g. rahul@example.com"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Phone Number <span class="text-danger">*</span></label>
              <input
                type="tel"
                class="form-control"
                name="phone"
                [(ngModel)]="student.phone"
                placeholder="e.g. 9876543210"
                required
              />
            </div>

            <div class="col-12 mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
              <a routerLink="/students" class="btn btn-light rounded-pill px-4">Cancel</a>
              <button
                type="submit"
                class="btn btn-primary rounded-pill px-4"
                [disabled]="!studentForm.form.valid || isSubmitting"
              >
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                {{ isEditMode ? 'Update Student' : 'Save Student' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class StudentFormComponent implements OnInit {
  isEditMode = false;
  studentId: number | null = null;
  isSubmitting = false;
  errorMessage = '';

  student: StudentRequest = {
    registerNumber: '',
    name: '',
    branch: '',
    year: 1,
    section: 'A',
    email: '',
    phone: ''
  };

  constructor(
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.isEditMode = true;
      this.studentId = Number(idParam);
      this.loadStudent(this.studentId);
    }
  }

  loadStudent(id: number): void {
    this.studentService.getStudentById(id).subscribe({
      next: (res) => {
        if (res.data) {
          const s = res.data;
          this.student = {
            registerNumber: s.registerNumber,
            name: s.name,
            branch: s.branch,
            year: s.year,
            section: s.section,
            email: s.email,
            phone: s.phone
          };
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to fetch student details.';
      }
    });
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.isEditMode && this.studentId) {
      this.studentService.updateStudent(this.studentId, this.student).subscribe({
        next: () => {
          this.router.navigate(['/students']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update student.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.studentService.createStudent(this.student).subscribe({
        next: () => {
          this.router.navigate(['/students']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to create student.';
          this.isSubmitting = false;
        }
      });
    }
  }
}
