import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudentListComponent } from './students/student-list/student-list.component';
import { StudentFormComponent } from './students/student-form/student-form.component';
import { FacultyListComponent } from './faculty/faculty-list/faculty-list.component';
import { FacultyFormComponent } from './faculty/faculty-form/faculty-form.component';
import { FacultyAssignmentsComponent } from './faculty/faculty-assignments/faculty-assignments.component';
import { FacultyDashboardComponent } from './faculty/faculty-dashboard/faculty-dashboard.component';
import { HallListComponent } from './halls/hall-list/hall-list.component';
import { HallFormComponent } from './halls/hall-form/hall-form.component';
import { HallViewComponent } from './halls/hall-view/hall-view.component';
import { ExamListComponent } from './exams/exam-list/exam-list.component';
import { ExamFormComponent } from './exams/exam-form/exam-form.component';
import { ExamStudentsComponent } from './exams/exam-students/exam-students.component';
import { GenerateSeatingComponent } from './seating/generate-seating/generate-seating.component';
import { SeatingArrangementComponent } from './seating/seating-arrangement/seating-arrangement.component';
import { StudentSeatSearchComponent } from './seating/student-seat-search/student-seat-search.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { ReportsComponent } from './reports/reports.component';
import { IncidentsComponent } from './incidents/incidents.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { HodPortalComponent } from './hod/hod-portal/hod-portal.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  // Student Routes
  { 
    path: 'students', 
    component: StudentListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'HOD'] }
  },
  { 
    path: 'students/new', 
    component: StudentFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'students/edit/:id', 
    component: StudentFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },

  // Faculty Routes (Admin Only)
  { 
    path: 'faculty', 
    component: FacultyListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'faculty/new', 
    component: FacultyFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'faculty/edit/:id', 
    component: FacultyFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'faculty/assignments', 
    component: FacultyAssignmentsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'faculty/dashboard', 
    component: FacultyDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['FACULTY', 'ADMIN'] }
  },

  // Hall & Seat Routes
  { 
    path: 'halls', 
    component: HallListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT', 'HOD'] }
  },
  { 
    path: 'halls/new', 
    component: HallFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'halls/edit/:id', 
    component: HallFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'halls/view/:id', 
    component: HallViewComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT'] }
  },

  // Exam Routes
  { 
    path: 'exams', 
    component: ExamListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT', 'HOD'] }
  },
  { 
    path: 'exams/new', 
    component: ExamFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'exams/edit/:id', 
    component: ExamFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'exams/:id/students', 
    component: ExamStudentsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },

  // Seating Arrangement Routes
  { 
    path: 'seating/generate', 
    component: GenerateSeatingComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'seating/arrangement', 
    component: SeatingArrangementComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT'] }
  },
  { 
    path: 'seating/arrangement/:examId', 
    component: SeatingArrangementComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'STUDENT', 'HOD'] }
  },
  { 
    path: 'seating/search', 
    component: StudentSeatSearchComponent 
  },

  // Attendance (Admin and Faculty)
  { 
    path: 'attendance', 
    component: AttendanceComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'FACULTY'] }
  },

  // Reports (Admin & HOD)
  { 
    path: 'reports', 
    component: ReportsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'HOD'] }
  },

  // Malpractice & Incident Reports (Admin, Faculty, HOD)
  { 
    path: 'incidents', 
    component: IncidentsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'FACULTY', 'HOD'] }
  },

  // Security & Audit Logs (Admin Only)
  { 
    path: 'audit-logs', 
    component: AuditLogsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },

  // HOD Department Portal Routes (Admin & HOD)
  { 
    path: 'hod/portal', 
    component: HodPortalComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'HOD'] }
  },
  { 
    path: 'hod/portal/:branch', 
    component: HodPortalComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'HOD'] }
  },

  // Fallback
  { path: '**', redirectTo: 'dashboard' }
];
