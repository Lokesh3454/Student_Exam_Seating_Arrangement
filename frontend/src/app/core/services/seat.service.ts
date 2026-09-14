import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Seat, SeatStatus } from '../models/seat.model';

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private apiUrl = `${environment.apiUrl}/seats`;

  constructor(private http: HttpClient) {}

  getSeatsByHallId(hallId: number): Observable<ApiResponse<Seat[]>> {
    return this.http.get<ApiResponse<Seat[]>>(`${this.apiUrl}/hall/${hallId}`);
  }

  getSeatById(id: number): Observable<ApiResponse<Seat>> {
    return this.http.get<ApiResponse<Seat>>(`${this.apiUrl}/${id}`);
  }

  updateSeatStatus(id: number, status: SeatStatus): Observable<ApiResponse<Seat>> {
    return this.http.put<ApiResponse<Seat>>(`${this.apiUrl}/${id}/status`, { status });
  }
}
