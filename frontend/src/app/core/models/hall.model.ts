export interface Hall {
  id: number;
  hallNumber: string;
  building: string;
  floor: number;
  rowsCount: number;
  columnsCount: number;
  capacity: number;
  totalSeats?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HallRequest {
  hallNumber: string;
  building: string;
  floor: number;
  rowsCount: number;
  columnsCount: number;
}
