export interface ApiResponse<T> {
  timestamp: string;
  success: boolean;
  message: string;
  data: T;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  path: string;
  errors?: { [key: string]: string };
}
