
export type AttendanceStatus = "Present" | "Late" | "Absent" | "Not Marked";

export interface Employee {
  id: string;
  name: string;
  designation: string; // Changed from role
  phone: string;
  email?: string;
  address?: string;
  gender: "Male" | "Female";
  experience: number; // years
  avatarUrl: string;
  birthday: string; // YYYY-MM-DD
  employed: boolean;
  employmentType: "Full Time" | "Contractor" | "Intern";
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, optional for currently employed
  hourlyPayRate?: number;
  trackAttendance: boolean; // New field to control attendance tracking
  ptoDays: number; // New field for Paid Time Off days remaining
}

export interface AttendanceRecord {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime: string; // HH:mm
  checkOutTime?: string; // HH:mm
  hoursWorked?: number; // Calculated and capped hours for the workday
}

export const AllStatuses: AttendanceStatus[] = ["Present", "Late", "Absent", "Not Marked"];

export interface Document {
  id: string;
  name: string;
  type: "profile-picture" | "aadhaar-card" | "other";
  dateUploaded: string; // YYYY-MM-DD
  url: string;
}
    
