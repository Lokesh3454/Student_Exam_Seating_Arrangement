export interface AuditLog {
  id: number;
  username: string;
  userRole?: string;
  action: string;
  targetEntity?: string;
  details?: string;
  timestamp: string;
}
