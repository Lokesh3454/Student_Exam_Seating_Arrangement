export type IncidentType =
  | 'UNAUTHORIZED_MATERIALS'
  | 'ELECTRONIC_DEVICE'
  | 'IMPERSONATION'
  | 'DISRUPTIVE_BEHAVIOR'
  | 'TALKING_OR_COPYING'
  | 'LEAVING_WITHOUT_PERMISSION'
  | 'OTHER';

export type IncidentStatus =
  | 'REPORTED'
  | 'UNDER_REVIEW'
  | 'CONFIRMED_ACTION_TAKEN'
  | 'DISMISSED';

export interface MalpracticeIncident {
  id: number;
  examId: number;
  examName: string;
  hallId: number;
  hallNumber: string;
  studentId: number;
  studentName: string;
  studentRegisterNumber: string;
  studentBranch: string;
  reportedBy: string;
  incidentType: IncidentType;
  description: string;
  confiscatedItems?: string;
  actionTaken?: string;
  status: IncidentStatus;
  reportedAt: string;
}

export interface IncidentRequest {
  examId: number;
  hallId: number;
  studentId: number;
  incidentType: IncidentType;
  description: string;
  confiscatedItems?: string;
  actionTaken?: string;
}
