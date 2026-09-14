import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Student, StudentRequest, StudentImportSummary, ConcurrentBranchImportSummary } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<ApiResponse<Student[]>> {
    return this.http.get<ApiResponse<Student[]>>(this.apiUrl);
  }

  getMyProfile(): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`${this.apiUrl}/me`);
  }

  getStudentById(id: number): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`${this.apiUrl}/${id}`);
  }

  getStudentByRegisterNumber(regNo: string): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`${this.apiUrl}/register/${encodeURIComponent(regNo)}`);
  }

  searchStudents(keyword: string): Observable<ApiResponse<Student[]>> {
    return this.http.get<ApiResponse<Student[]>>(`${this.apiUrl}/search`, {
      params: { keyword }
    });
  }

  createStudent(student: StudentRequest): Observable<ApiResponse<Student>> {
    return this.http.post<ApiResponse<Student>>(this.apiUrl, student);
  }

  updateStudent(id: number, student: StudentRequest): Observable<ApiResponse<Student>> {
    return this.http.put<ApiResponse<Student>>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  importStudents(file: File, examId?: number): Observable<ApiResponse<StudentImportSummary>> {
    const formData = new FormData();
    formData.append('file', file);
    const params: any = {};
    if (examId) {
      params.examId = examId;
    }
    return this.http.post<ApiResponse<StudentImportSummary>>(
      `${this.apiUrl}/import`,
      formData,
      { params }
    );
  }

  downloadCsvTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/csv-template`, {
      responseType: 'blob'
    });
  }

  importConcurrentBranchStudents(
    files: File[],
    examDate: string,
    startTime: string,
    endTime: string,
    autoAllocateSeating: boolean = true,
    branches?: string[]
  ): Observable<ApiResponse<ConcurrentBranchImportSummary>> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    if (branches && branches.length > 0) {
      for (const branch of branches) {
        formData.append('branches', branch);
      }
    }
    const params: any = {
      examDate,
      startTime,
      endTime,
      autoAllocateSeating
    };
    return this.http.post<ApiResponse<ConcurrentBranchImportSummary>>(
      `${this.apiUrl}/import-concurrent-branches`,
      formData,
      { params }
    );
  }

  downloadConcurrentTemplate(branch: string = 'CSE'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/concurrent-template`, {
      params: { branch },
      responseType: 'blob'
    });
  }
}
