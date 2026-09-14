export interface Student {
  id: number;
  registerNumber: string;
  name: string;
  branch: string;
  year: number;
  section: string;
  email: string;
  phone: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentRequest {
  registerNumber: string;
  name: string;
  branch: string;
  year: number;
  section: string;
  email: string;
  phone: string;
}

export interface HallAllocation {
  hallId: number;
  hallNumber: string;
  building: string;
  capacity: number;
  assignedCount: number;
  filled: boolean;
}

export interface ImportRowError {
  rowNumber: number;
  registerNumber: string;
  reason: string;
}

export interface StudentImportSummary {
  totalRows: number;
  successfullyImported: number;
  failedRows: number;
  duplicateRows: number;
  examId?: number;
  examName?: string;
  hallAllocations?: HallAllocation[];
  errors: ImportRowError[];
}

export interface BranchImportResult {
  branch: string;
  examId?: number;
  examName?: string;
  subject?: string;
  fileName: string;
  totalRows: number;
  successfullyImported: number;
  duplicateRows: number;
  failedRows: number;
  errors: ImportRowError[];
  hallAllocations: HallAllocation[];
}

export interface ConcurrentBranchImportSummary {
  sessionDate: string;
  startTime: string;
  endTime: string;
  totalBranchesProcessed: number;
  totalStudentsImported: number;
  totalDuplicates: number;
  totalFailed: number;
  overallStatus: string;
  branchResults: BranchImportResult[];
}


