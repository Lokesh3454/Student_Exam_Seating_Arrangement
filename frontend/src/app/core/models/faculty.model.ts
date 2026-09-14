export interface Faculty {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacultyRequest {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
}
