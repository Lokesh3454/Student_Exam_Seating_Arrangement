import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Exam, ExamRequest, ExamImportSummary, ConcurrentExamSession } from '../models/exam.model';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = `${environment.apiUrl}/exams`;

  constructor(private http: HttpClient) {}

  getAllExams(): Observable<ApiResponse<Exam[]>> {
    return this.http.get<ApiResponse<Exam[]>>(this.apiUrl);
  }

  getExamById(id: number): Observable<ApiResponse<Exam>> {
    return this.http.get<ApiResponse<Exam>>(`${this.apiUrl}/${id}`);
  }

  createExam(exam: ExamRequest): Observable<ApiResponse<Exam>> {
    return this.http.post<ApiResponse<Exam>>(this.apiUrl, exam);
  }

  updateExam(id: number, exam: ExamRequest): Observable<ApiResponse<Exam>> {
    return this.http.put<ApiResponse<Exam>>(`${this.apiUrl}/${id}`, exam);
  }

  deleteExam(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getStudentsByExamId(examId: number): Observable<ApiResponse<Student[]>> {
    return this.http.get<ApiResponse<Student[]>>(`${this.apiUrl}/${examId}/students`);
  }

  assignStudentsToExam(examId: number, studentIds: number[]): Observable<ApiResponse<Student[]>> {
    return this.http.post<ApiResponse<Student[]>>(`${this.apiUrl}/${examId}/students`, { studentIds });
  }

  removeStudentFromExam(examId: number, studentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${examId}/students/${studentId}`);
  }

  importExams(file: File): Observable<ApiResponse<ExamImportSummary>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<ExamImportSummary>>(
      `${this.apiUrl}/import`,
      formData
    );
  }

  getExamsByBranch(branch: string): Observable<ApiResponse<Exam[]>> {
    return this.http.get<ApiResponse<Exam[]>>(`${this.apiUrl}/branch/${encodeURIComponent(branch)}`);
  }

  updateAllottedHalls(examId: number, hallIds: number[]): Observable<ApiResponse<Exam>> {
    return this.http.put<ApiResponse<Exam>>(`${this.apiUrl}/${examId}/allotted-halls`, hallIds);
  }

  autoEnrollByBranch(examId: number): Observable<ApiResponse<Student[]>> {
    return this.http.post<ApiResponse<Student[]>>(`${this.apiUrl}/${examId}/students/auto-enroll-branch`, {});
  }

  downloadCsvTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/csv-template`, {
      responseType: 'blob'
    });
  }

  getConcurrentSessions(): Observable<ApiResponse<ConcurrentExamSession[]>> {
    return this.http.get<ApiResponse<ConcurrentExamSession[]>>(`${this.apiUrl}/concurrent-sessions`);
  }
}
