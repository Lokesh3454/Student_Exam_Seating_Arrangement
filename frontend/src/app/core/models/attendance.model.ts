export interface AttendanceStudentDto {
  studentId: number;
  registerNumber: string;
  name: string;
  branch: string;
  section: string;
  year: number;
  seatId: number;
  seatNumber: string;
  rowNumber: number;
  columnNumber: number;
  attendanceId?: number;
  status: 'PRESENT' | 'ABSENT' | 'UNMARKED';
  remarks?: string;
}

export interface HallAttendanceResponse {
  examId: number;
  examName: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  hallId: number;
  hallNumber?: string;
  hallCode?: string;
  building: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  unmarkedCount?: number;
  attendancePercentage?: number;
  students: AttendanceStudentDto[];
}

export interface AttendanceRecordItem {
  studentId: number;
  status: 'PRESENT' | 'ABSENT';
  remarks?: string;
}

export interface SaveAttendanceRequest {
  examId: number;
  hallId: number;
  records: AttendanceRecordItem[];
}

export interface AttendanceUpdateRequest {
  status: 'PRESENT' | 'ABSENT' | 'UNMARKED';
  remarks?: string;
}
