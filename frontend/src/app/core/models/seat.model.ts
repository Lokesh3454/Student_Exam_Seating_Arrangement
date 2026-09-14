export type SeatStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Seat {
  id: number;
  hallId: number;
  hallNumber: string;
  rowNumber: number;
  columnNumber: number;
  seatNumber: string;
  status: SeatStatus;
}
