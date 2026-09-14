import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Hall, HallRequest } from '../models/hall.model';
import { Seat } from '../models/seat.model';

@Injectable({
  providedIn: 'root'
})
export class HallService {
  private apiUrl = `${environment.apiUrl}/halls`;

  constructor(private http: HttpClient) {}

  getAllHalls(): Observable<ApiResponse<Hall[]>> {
    return this.http.get<ApiResponse<Hall[]>>(this.apiUrl);
  }

  getHallById(id: number): Observable<ApiResponse<Hall>> {
    return this.http.get<ApiResponse<Hall>>(`${this.apiUrl}/${id}`);
  }

  getSeatsByHallId(id: number): Observable<ApiResponse<Seat[]>> {
    return this.http.get<ApiResponse<Seat[]>>(`${this.apiUrl}/${id}/seats`);
  }

  createHall(hall: HallRequest): Observable<ApiResponse<Hall>> {
    return this.http.post<ApiResponse<Hall>>(this.apiUrl, hall);
  }

  updateHall(id: number, hall: HallRequest): Observable<ApiResponse<Hall>> {
    return this.http.put<ApiResponse<Hall>>(`${this.apiUrl}/${id}`, hall);
  }

  deleteHall(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  importHalls(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/import`, formData);
  }

  downloadCsvTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/csv-template`, {
      responseType: 'blob'
    });
  }
}
