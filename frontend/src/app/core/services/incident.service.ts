import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { IncidentRequest, MalpracticeIncident, IncidentStatus } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private apiUrl = 'http://localhost:8080/api/incidents';

  constructor(private http: HttpClient) {}

  getAllIncidents(examId?: number, studentId?: number): Observable<ApiResponse<MalpracticeIncident[]>> {
    let params = new HttpParams();
    if (examId) params = params.set('examId', examId.toString());
    if (studentId) params = params.set('studentId', studentId.toString());
    return this.http.get<ApiResponse<MalpracticeIncident[]>>(this.apiUrl, { params });
  }

  reportIncident(req: IncidentRequest): Observable<ApiResponse<MalpracticeIncident>> {
    return this.http.post<ApiResponse<MalpracticeIncident>>(this.apiUrl, req);
  }

  updateStatus(id: number, status: IncidentStatus, actionTaken?: string): Observable<ApiResponse<MalpracticeIncident>> {
    return this.http.patch<ApiResponse<MalpracticeIncident>>(`${this.apiUrl}/${id}/status`, { status, actionTaken });
  }

  deleteIncident(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
