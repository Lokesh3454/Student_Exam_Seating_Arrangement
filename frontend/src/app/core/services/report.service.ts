import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { StudentService } from './student.service';
import { HallService } from './hall.service';
import { ExamService } from './exam.service';
import { FacultyService } from './faculty.service';
import {
  ExamWiseReport,
  HallWiseReport,
  StudentWiseReport,
  AttendanceReport
} from '../models/report.model';

export interface DashboardMetrics {
  totalStudents: number;
  totalHalls: number;
  totalCapacity: number;
  totalExams: number;
  totalFaculty: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(
    private http: HttpClient,
    private studentService: StudentService,
    private hallService: HallService,
    private examService: ExamService,
    private facultyService: FacultyService
  ) {}

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return forkJoin({
      students: this.studentService.getAllStudents(),
      halls: this.hallService.getAllHalls(),
      exams: this.examService.getAllExams(),
      faculty: this.facultyService.getAllFaculty()
    }).pipe(
      map(res => {
        const totalCapacity = (res.halls.data || []).reduce((acc, h) => acc + (h.capacity || 0), 0);
        return {
          totalStudents: res.students.data?.length || 0,
          totalHalls: res.halls.data?.length || 0,
          totalCapacity,
          totalExams: res.exams.data?.length || 0,
          totalFaculty: res.faculty.data?.length || 0
        };
      })
    );
  }

  getExamWiseReport(examId?: number): Observable<ApiResponse<ExamWiseReport[]>> {
    let params = new HttpParams();
    if (examId) {
      params = params.set('examId', examId.toString());
    }
    return this.http.get<ApiResponse<ExamWiseReport[]>>(`${this.apiUrl}/exam-wise`, { params });
  }

  getHallWiseReport(examId?: number, hallId?: number): Observable<ApiResponse<HallWiseReport[]>> {
    let params = new HttpParams();
    if (examId) {
      params = params.set('examId', examId.toString());
    }
    if (hallId) {
      params = params.set('hallId', hallId.toString());
    }
    return this.http.get<ApiResponse<HallWiseReport[]>>(`${this.apiUrl}/hall-wise`, { params });
  }

  getStudentWiseReport(examId?: number, keyword?: string): Observable<ApiResponse<StudentWiseReport[]>> {
    let params = new HttpParams();
    if (examId) {
      params = params.set('examId', examId.toString());
    }
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<ApiResponse<StudentWiseReport[]>>(`${this.apiUrl}/student-wise`, { params });
  }

  getAttendanceReport(examId?: number, date?: string): Observable<ApiResponse<AttendanceReport[]>> {
    let params = new HttpParams();
    if (examId) {
      params = params.set('examId', examId.toString());
    }
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<ApiResponse<AttendanceReport[]>>(`${this.apiUrl}/attendance`, { params });
  }

  getDashboardStats(): Observable<ApiResponse<import('../models/report.model').DashboardStats>> {
    return this.http.get<ApiResponse<import('../models/report.model').DashboardStats>>(`${this.apiUrl}/dashboard-stats`);
  }

  downloadExamSeatingPdf(examId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/pdf/exam-seating/${examId}`, {
      responseType: 'blob'
    });
  }

  downloadHallChartPdf(hallId: number, examId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/pdf/hall-chart/${hallId}/${examId}`, {
      responseType: 'blob'
    });
  }

  downloadStudentReportPdf(examId?: number, keyword?: string): Observable<Blob> {
    let params = new HttpParams();
    if (examId) params = params.set('examId', examId.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get(`${this.apiUrl}/export/pdf/student-report`, {
      params,
      responseType: 'blob'
    });
  }

  downloadAttendanceReportPdf(examId: number, hallId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (hallId) params = params.set('hallId', hallId.toString());
    return this.http.get(`${this.apiUrl}/export/pdf/attendance/${examId}`, {
      params,
      responseType: 'blob'
    });
  }

  downloadAdmitCardPdf(examId: number, studentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/pdf/admit-card/${examId}/${studentId}`, {
      responseType: 'blob'
    });
  }

  triggerFileDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
