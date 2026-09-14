export interface ExamWiseReport {
  examId: number;
  examName: string;
  subject: string;
  examDate: string;
  timeSlot?: string;
  startTime?: string;
  endTime?: string;
  enrolledStudentsCount?: number;
  totalEligibleStudents?: number;
  totalSeatsAssigned?: number;
  totalAllocatedSeats?: number;
  hallsUsedCount?: number;
  totalHallsUsed?: number;
  presentCount?: number;
  absentCount?: number;
  attendancePercentage?: number;
  status: string;
}

export interface SeatAssignmentItem {
  seatNumber: string;
  rowNumber?: number;
  columnNumber?: number;
  studentRegisterNumber: string;
  studentName: string;
  branch: string;
}

export interface HallWiseReport {
  hallId: number;
  hallNumber: string;
  building: string;
  floor?: number;
  capacity: number;
  examId?: number;
  examName?: string;
  subject?: string;
  studentCount?: number;
  totalSeatsOccupied?: number;
  occupancyPercentage?: number;
  assignedFacultyName?: string;
  assignedFacultyEmpId?: string;
  seatAssignments?: SeatAssignmentItem[];
}

export interface StudentWiseReport {
  registerNumber: string;
  studentName: string;
  branch: string;
  year: number;
  section: string;
  examId?: number;
  examName?: string;
  subject?: string;
  examDate?: string;
  hallNumber?: string;
  building?: string;
  seatNumber?: string;
  rowNumber?: number;
  columnNumber?: number;
  attendanceStatus?: string;
}

export interface AttendanceReport {
  examId?: number;
  examName: string;
  subject: string;
  examDate: string;
  hallId?: number;
  hallNumber: string;
  building: string;
  totalStudents: number;
  present?: number;
  presentCount?: number;
  absent?: number;
  absentCount?: number;
  malpractice?: number;
  attendancePercentage: number;
}

export interface UpcomingExam {
  id: number;
  examCode: string;
  title: string;
  examDate: string;
  startTime: string;
  endTime: string;
  assignedStudents: number;
  status: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalHalls: number;
  totalExams: number;
  totalFaculty: number;
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;
  upcomingExamsCount: number;
  upcomingExams: UpcomingExam[];
  branchDistribution: { [branch: string]: number };
}
