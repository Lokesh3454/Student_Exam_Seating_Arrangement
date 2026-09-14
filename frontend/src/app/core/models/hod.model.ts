import { Exam } from './exam.model';
import { MalpracticeIncident } from './incident.model';

export interface DepartmentHallMetric {
  hallId: number;
  hallNumber: string;
  building: string;
  capacity: number;
  assignedCount: number;
  filled: boolean;
}

export interface HodDashboardData {
  branch: string;
  departmentName: string;
  totalStudents: number;
  totalExams: number;
  totalAllottedSeats: number;
  totalEnrolledStudents: number;
  seatingAllocatedCount: number;
  incidentsCount: number;
  upcomingExams: Exam[];
  allottedHalls: DepartmentHallMetric[];
  recentIncidents: MalpracticeIncident[];
}
