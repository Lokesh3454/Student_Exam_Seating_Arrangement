export type ExamStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Exam {
  id: number;
  examName: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  status: ExamStatus;
  branch?: string;
  allottedHallIds?: number[];
  allottedHalls?: any[];
  allottedCapacity?: number;
  registeredStudentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamRequest {
  examName: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  status?: ExamStatus;
  branch?: string;
  hallIds?: number[];
}

export interface ExamImportError {
  rowNumber: number;
  examName?: string;
  reason: string;
}

export interface ExamImportSummary {
  totalRows: number;
  successfullyImported: number;
  failedRows: number;
  duplicateRows: number;
  errors: ExamImportError[];
}

export interface ConcurrentExamSession {
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionLabel: string;
  totalBranches: number;
  branchExams: Exam[];
  totalEnrolled: number;
  totalAllottedCapacity: number;
}


