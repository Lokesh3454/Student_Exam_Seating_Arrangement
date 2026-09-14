import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  GenerateSeatingRequest,
  SeatingGenerationResponse,
  SeatingArrangementDetail,
  StudentSeatSearchResponse
} from '../models/seating.model';

@Injectable({
  providedIn: 'root'
})
export class SeatingService {
  private apiUrl = `${environment.apiUrl}/seating`;

  constructor(private http: HttpClient) {}

  generateSeating(examId: number, request?: GenerateSeatingRequest): Observable<ApiResponse<SeatingGenerationResponse>> {
    return this.http.post<ApiResponse<SeatingGenerationResponse>>(
      `${this.apiUrl}/generate/${examId}`,
      request || { strategy: 'SEQUENTIAL' }
    );
  }

  regenerateSeating(examId: number, request?: GenerateSeatingRequest): Observable<ApiResponse<SeatingGenerationResponse>> {
    return this.http.post<ApiResponse<SeatingGenerationResponse>>(
      `${this.apiUrl}/regenerate/${examId}`,
      request || { strategy: 'SEQUENTIAL' }
    );
  }

  validateConflicts(examId: number, request?: GenerateSeatingRequest): Observable<ApiResponse<import('../models/seating.model').ConflictCheckResponse>> {
    return this.http.post<ApiResponse<import('../models/seating.model').ConflictCheckResponse>>(
      `${this.apiUrl}/validate-conflicts/${examId}`,
      request || {}
    );
  }

  getArrangementByExamId(examId: number): Observable<ApiResponse<SeatingArrangementDetail[]>> {
    return this.http.get<ApiResponse<SeatingArrangementDetail[]>>(`${this.apiUrl}/exam/${examId}`);
  }

  getArrangementByHallAndExam(hallId: number, examId: number): Observable<ApiResponse<SeatingArrangementDetail[]>> {
    return this.http.get<ApiResponse<SeatingArrangementDetail[]>>(`${this.apiUrl}/hall/${hallId}/exam/${examId}`);
  }

  searchStudentSeat(registerNumber: string, examId: number): Observable<ApiResponse<StudentSeatSearchResponse>> {
    return this.http.get<ApiResponse<StudentSeatSearchResponse>>(
      `${this.apiUrl}/student/${encodeURIComponent(registerNumber)}/exam/${examId}`
    );
  }

  deleteArrangementByExam(examId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/exam/${examId}`);
  }
}
