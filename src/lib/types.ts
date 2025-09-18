
export type AttendanceStatus = "Present" | "Late" | "Absent" | "Not Marked";

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  gender: "Male" | "Female";
  experience: number; // years
  avatarUrl: string;
  birthday: string; // YYYY-MM-DD
  employed: boolean;
  hourlyPayRate?: number;
}

export interface AttendanceRecord {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime: string; // HH:mm
  checkOutTime?: string; // HH:mm
}

export const AllStatuses: AttendanceStatus[] = ["Present", "Late", "Absent", "Not Marked"];

    
