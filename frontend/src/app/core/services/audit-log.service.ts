import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { AuditLog } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = 'http://localhost:8080/api/audit-logs';

  constructor(private http: HttpClient) {}

  getAuditLogs(search?: string): Observable<ApiResponse<AuditLog[]>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<ApiResponse<AuditLog[]>>(this.apiUrl, { params });
  }
}
