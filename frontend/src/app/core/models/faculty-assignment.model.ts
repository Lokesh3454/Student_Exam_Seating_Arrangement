export interface FacultyAssignment {
  id: number;
  facultyId: number;
  facultyName: string;
  employeeId: string;
  facultyEmail: string;
  facultyPhone?: string;
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
  totalStudents?: number;
  assignedStudentsCount?: number;
  attendanceSummary?: string;
  status?: string;
}

export interface FacultyAssignmentRequest {
  facultyId: number;
  examId: number;
  hallId: number;
}
