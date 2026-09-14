export type SeatingStrategy = 'SEQUENTIAL' | 'RANDOM' | 'BRANCH_ALTERNATION' | 'SECTION_ALTERNATION' | 'ADJACENT_BRANCH_SEPARATION';

export interface GenerateSeatingRequest {
  strategy: SeatingStrategy;
  hallIds?: number[];
}

export interface ConflictDetail {
  type: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
}

export interface ConflictCheckResponse {
  hasConflicts: boolean;
  eligibleStudentCount: number;
  totalAvailableSeats: number;
  deficitSeats: number;
  alreadyGenerated: boolean;
  conflicts: ConflictDetail[];
}

export interface SeatingGenerationResponse {
  examId: number;
  examName: string;
  totalStudents: number;
  totalSeatsUsed: number;
  hallsUsed: number;
  strategy: SeatingStrategy;
}

export interface StudentSeatSearchResponse {
  studentName: string;
  registerNumber: string;
  exam: string;
  date: string;
  hall: string;
  hallRows?: number;
  hallColumns?: number;
  row: number;
  column: number;
  seat: string;
}

export interface SeatingArrangementDetail {
  id: number;
  examId: number;
  examName: string;
  studentId: number;
  studentRegisterNumber: string;
  studentName: string;
  studentBranch: string;
  studentSection: string;
  hallId: number;
  hallNumber: string;
  building: string;
  seatId: number;
  seatNumber: string;
  rowNumber: number;
  columnNumber: number;
  arrangementDate?: string;
}
