import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  HallAttendanceResponse,
  SaveAttendanceRequest,
  AttendanceUpdateRequest,
  AttendanceStudentDto
} from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  getHallAttendance(examId: number, hallId: number): Observable<ApiResponse<HallAttendanceResponse>> {
    return this.http.get<ApiResponse<HallAttendanceResponse>>(`${this.apiUrl}/exam/${examId}/hall/${hallId}`);
  }

  saveAttendance(request: SaveAttendanceRequest): Observable<ApiResponse<HallAttendanceResponse>> {
    return this.http.post<ApiResponse<HallAttendanceResponse>>(this.apiUrl, request);
  }

  updateSingleAttendance(id: number, request: AttendanceUpdateRequest): Observable<ApiResponse<AttendanceStudentDto>> {
    return this.http.put<ApiResponse<AttendanceStudentDto>>(`${this.apiUrl}/${id}`, request);
  }
}
