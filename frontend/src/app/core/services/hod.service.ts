import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { HodDashboardData } from '../models/hod.model';
import { Student } from '../models/student.model';
import { Exam } from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class HodService {
  private apiUrl = `${environment.apiUrl}/hod`;

  constructor(private http: HttpClient) {}

  getDashboard(branch?: string): Observable<ApiResponse<HodDashboardData>> {
    const params: any = {};
    if (branch) {
      params.branch = branch;
    }
    return this.http.get<ApiResponse<HodDashboardData>>(`${this.apiUrl}/dashboard`, { params });
  }

  getDepartmentStudents(branch?: string): Observable<ApiResponse<Student[]>> {
    const params: any = {};
    if (branch) {
      params.branch = branch;
    }
    return this.http.get<ApiResponse<Student[]>>(`${this.apiUrl}/students`, { params });
  }

  getDepartmentExams(branch?: string): Observable<ApiResponse<Exam[]>> {
    const params: any = {};
    if (branch) {
      params.branch = branch;
    }
    return this.http.get<ApiResponse<Exam[]>>(`${this.apiUrl}/exams`, { params });
  }
}
