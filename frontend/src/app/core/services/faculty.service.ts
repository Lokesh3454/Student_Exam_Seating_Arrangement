import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Faculty, FacultyRequest } from '../models/faculty.model';
import { FacultyAssignment, FacultyAssignmentRequest } from '../models/faculty-assignment.model';

@Injectable({
  providedIn: 'root'
})
export class FacultyService {
  private apiUrl = `${environment.apiUrl}/faculty`;
  private assignmentUrl = `${environment.apiUrl}/faculty/assignments`;

  constructor(private http: HttpClient) {}

  getAllFaculty(): Observable<ApiResponse<Faculty[]>> {
    return this.http.get<ApiResponse<Faculty[]>>(this.apiUrl);
  }

  getFacultyById(id: number): Observable<ApiResponse<Faculty>> {
    return this.http.get<ApiResponse<Faculty>>(`${this.apiUrl}/${id}`);
  }

  createFaculty(faculty: FacultyRequest): Observable<ApiResponse<Faculty>> {
    return this.http.post<ApiResponse<Faculty>>(this.apiUrl, faculty);
  }

  updateFaculty(id: number, faculty: FacultyRequest): Observable<ApiResponse<Faculty>> {
    return this.http.put<ApiResponse<Faculty>>(`${this.apiUrl}/${id}`, faculty);
  }

  deleteFaculty(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Hall invigilation assignments
  assignFaculty(request: FacultyAssignmentRequest): Observable<ApiResponse<FacultyAssignment>> {
    return this.http.post<ApiResponse<FacultyAssignment>>(this.assignmentUrl, request);
  }

  getAssignmentsByExam(examId: number): Observable<ApiResponse<FacultyAssignment[]>> {
    return this.http.get<ApiResponse<FacultyAssignment[]>>(`${this.assignmentUrl}/exam/${examId}`);
  }

  getAssignmentsByFaculty(facultyId: number): Observable<ApiResponse<FacultyAssignment[]>> {
    return this.http.get<ApiResponse<FacultyAssignment[]>>(`${this.assignmentUrl}/faculty/${facultyId}`);
  }

  getMyDuties(): Observable<ApiResponse<FacultyAssignment[]>> {
    return this.http.get<ApiResponse<FacultyAssignment[]>>(`${this.assignmentUrl}/my-duties`);
  }

  deleteAssignment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.assignmentUrl}/${id}`);
  }
}
