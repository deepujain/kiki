
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from 'next/navigation'
import {
  AttendanceRecord,
  Employee,
  AttendanceStatus,
} from "@/lib/types";
import { useData } from "@/hooks/use-database";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  eachDayOfInterval,
  getDay,
  isBefore,
  isToday,
  differenceInMinutes,
  parse,
  addMonths,
  subMonths,
  getMonth,
  getYear,
} from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Cake, Download, ArrowUpDown } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";


const today = new Date();
const todayStr = format(today, "yyyy-MM-dd");
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type EmployeeFilter = "current" | "not_employed" | "all";
type ExportPeriod = "CurrentMonth" | "MonthToDate";


interface AttendanceSummary {
  workDays: number;
  present: number;
  absent: number;
  annualPTODays: number;
  ptoUsedSoFar: number;
  ptoLeft: number;
  lateDays: number;
}

interface PaySummary {
  totalPresentDays: number;
  lateDays: number;
  totalAbsentDays: number;
  annualPTOAllotted: number;
  ptoUsedSoFar: number;
  ptoUsedThisMonth: number;
  ptoDaysLeft: number;
  netPayableDays: number;
  grossPay: number;
}

const calculateHours = (checkIn: string, checkOut: string): string => {
  if (checkIn === '--:--' || !checkOut || checkOut === '--:--') return '--';
  const checkInDate = parse(checkIn, 'HH:mm', new Date());
  const checkOutDate = parse(checkOut, 'HH:mm', new Date());
   if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate < checkInDate) {
    return '--';
  }
  
  const diffMins = differenceInMinutes(checkOutDate, checkInDate);
  let hours = diffMins / 60;

  // Cap hours at 8 and round to the nearest whole number
  return Math.min(Math.round(hours), 8).toString();
};

function StaffPageContent() {
  const searchParams = useSearchParams()
  const employeeIdFromQuery = searchParams.get('employeeId')

  const { employees = [], attendanceRecords = new Map(), holidays = [], updateEmployee, addEmployee, addHoliday, isLoading: dataLoading } = useData();
  const [employeeFilter, setEmployeeFilter] = useState<EmployeeFilter>("current");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editableEmployee, setEditableEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mtdSummary, setMtdSummary] = useState<AttendanceSummary | null>(null);
  const [ytdSummary, setYtdSummary] = useState<AttendanceSummary | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<Employee>>({
    employed: true,
    experience: 0
  });
  const { toast } = useToast();

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [dailyRecords, setDailyRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(today));
  const [sortColumn, setSortColumn] = useState<keyof Employee | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { user } = useAuth(); // Get user from auth context
  const isAdmin = user?.role === "Admin"; // Determine if user is admin
  const [paySummary, setPaySummary] = useState<PaySummary | null>(null); // New state for pay summary
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2025, 6, 1)); // Start from July 2025

  useEffect(() => {
    if (employeeIdFromQuery) {
      const employee = employees.find(e => e.id === employeeIdFromQuery);
      if (employee) {
        handleEmployeeClick(employee);
      }
    }
  }, [employeeIdFromQuery, employees]);

  useEffect(() => {
    if (selectedEmployee) {
      const freshEmployeeData = employees.find(e => e.id === selectedEmployee.id);
      if(freshEmployeeData) {
        setSelectedEmployee(freshEmployeeData);
        fetchAttendanceSummary(selectedEmployee);
      } else {
        setSelectedEmployee(null);
        setEditableEmployee(null);
        setPaySummary(null); // Clear pay summary on employee change
      }
    }
  }, [employees, selectedEmployee]);

  useEffect(() => {
    if (selectedEmployee) {
      setCalendarMonth(selectedMonth);
    }
  }, [selectedEmployee, selectedMonth]);

  const triggerStorageEvent = () => {
    window.dispatchEvent(new Event('storage'));
  }

  const getWorkingDays = (start: Date, end: Date) => {
      const days = eachDayOfInterval({ start, end });
      return days.filter(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        return getDay(day) !== 0 && !holidays.some(h => h.date === dayStr) && (isBefore(day, today) || isToday(day));
      }).length;
  }

  const fetchAttendanceSummary = (employee: Employee) => {
    const allRecords = attendanceRecords.get(employee.id) || [];

    // Calculate start and end dates for the selected month
    const startDate = startOfMonth(selectedMonth);
    const endDate = endOfMonth(selectedMonth);
    
    // If selected month is current month, limit end date to today
    const effectiveEndDate = getMonth(selectedMonth) === getMonth(today) ? today : endDate;

    // Calculate total absences for the entire year up to current date
    const yearStart = new Date(today.getFullYear(), 0, 1); // January 1st of current year
    const totalAnnualAbsences = allRecords.filter((r: AttendanceRecord) => {
        const recordDate = new Date(r.date);
        return r.status === 'Absent' && 
               recordDate >= yearStart && 
               recordDate <= today;
    }).length;

    // Get filtered records for the selected month (for display)
    const filteredRecords = allRecords.filter((r: AttendanceRecord) => {
        const recordDate = new Date(r.date);
        return recordDate >= startDate && recordDate <= endDate;
    });
    
    let totalHours = 0;
    filteredRecords.forEach((r: AttendanceRecord) => {
        if(r.checkInTime !== '--:--' && r.checkOutTime && r.checkOutTime !== '--:--') {
            const checkInDate = parse(r.checkInTime, 'HH:mm', new Date(r.date));
            const checkOutDate = parse(r.checkOutTime, 'HH:mm', new Date(r.date));
            if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime()) && checkOutDate > checkInDate) {
                totalHours += differenceInMinutes(checkOutDate, checkInDate) / 60;
            }
        }
    });

    let lateStreak = 0;
    const sortedRecords = filteredRecords.sort((a: AttendanceRecord, b: AttendanceRecord) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for(const record of sortedRecords) {
      if (record.status === 'Late' || record.status === 'Absent') {
        lateStreak++;
      } else if (record.status === 'Present') {
        break; // Streak broken by a 'Present' day
      }
    }

    // Calculate attendance summary
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    filteredRecords.forEach((r: AttendanceRecord) => {
      if (r.status === 'Present') {
        presentCount++;
      } else if (r.status === 'Late') {
        lateCount++;
      } else if (r.status === 'Absent') {
        absentCount++;
      }
    });

    // Add holidays to present count
    presentCount += holidays.filter(h => {
        const hDate = new Date(h.date);
        return hDate >= startDate && hDate <= endDate;
    }).length;

    // Calculate PTO usage
    const annualPTODays = employee.ptoDays || 0;
    const ptoUsedSoFar = Math.min(totalAnnualAbsences, annualPTODays);
    const ptoLeft = Math.max(0, annualPTODays - ptoUsedSoFar);

    const summary: AttendanceSummary = {
      workDays: getWorkingDays(startDate, endDate),
      present: presentCount,
      absent: absentCount,
      annualPTODays: annualPTODays,
      ptoUsedSoFar: ptoUsedSoFar,
      ptoLeft: ptoLeft,
      lateDays: lateCount
    };

    setMtdSummary(summary);
    setYtdSummary(summary); // For now, setting both to the same summary based on `period`

    // Calculate Pay Summary
    if (employee?.hourlyPayRate && (employee.role === 'TSE' || employee.role === 'Logistics' || employee.role === 'MIS')) {
      // Calculate total work days in the month (excluding Sundays and holidays)
      const totalWorkDays = getWorkingDays(startDate, effectiveEndDate);

      // Calculate present and late days separately
      const onlyPresentDays = filteredRecords.filter((r: AttendanceRecord) => r.status === 'Present').length;
      const lateDays = filteredRecords.filter((r: AttendanceRecord) => r.status === 'Late').length;
      
      // Add holidays to present days
      const holidayDays = holidays.filter(h => {
        const hDate = new Date(h.date);
        return hDate >= startDate && hDate <= effectiveEndDate;
      }).length;

      // Total present days includes Present, Late, and Holidays for pay calculation
      const presentDays = onlyPresentDays + lateDays + holidayDays;

      // Calculate total absent days for the selected month
      const absentDays = filteredRecords.filter((r: AttendanceRecord) => r.status === 'Absent').length;

      // 1. Calculate annual PTO status
      const annualPTOAllotted = employee.ptoDays;
      
      // Calculate total absences up to previous month
      const previousMonthEnd = new Date(startDate);
      previousMonthEnd.setDate(0); // Last day of previous month
      const absencesUpToPreviousMonth = allRecords.filter((r: AttendanceRecord) => {
        const recordDate = new Date(r.date);
        return r.status === 'Absent' && 
               recordDate >= new Date(today.getFullYear(), 0, 1) && // Start of year
               recordDate <= previousMonthEnd;
      }).length;

      // PTO used up to previous month
      const ptoUsedUpToPreviousMonth = Math.min(absencesUpToPreviousMonth, annualPTOAllotted);
      
      // PTO remaining at start of current month
      const ptoRemainingForMonth = Math.max(0, annualPTOAllotted - ptoUsedUpToPreviousMonth);
      
      // 2. Handle current month's absences
      const ptoUsedThisMonth = Math.min(absentDays, ptoRemainingForMonth);
      const unpaidAbsences = absentDays - ptoUsedThisMonth; // Absences not covered by PTO
      
      // 3. Calculate final PTO status
      const ptoUsedSoFar = ptoUsedUpToPreviousMonth + ptoUsedThisMonth;
      const ptoDaysLeft = annualPTOAllotted - ptoUsedSoFar;
      
      // 4. Calculate Net Payable Days
      // Present days + PTO-covered absences - unpaid absences
      const netPayableDays = presentDays + ptoUsedThisMonth;
      
      const dailyRate = 8 * employee.hourlyPayRate; // 8 hours per day
      const grossPay = netPayableDays * dailyRate;

      setPaySummary({
        totalPresentDays: onlyPresentDays + holidayDays, // Only actual present days + holidays
        lateDays, // Show late days separately
        totalAbsentDays: absentDays,
        annualPTOAllotted,
        ptoUsedSoFar,
        ptoUsedThisMonth,
        ptoDaysLeft,
        netPayableDays,
        grossPay,
      });
    } else {
      setPaySummary(null);
    }

  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditableEmployee({...employee});
    setMtdSummary(null);
    setYtdSummary(null);
    setPaySummary(null); // Clear pay summary when going back to list
    if(employee.role !== 'Owner') {
      fetchAttendanceSummary(employee);
    }
  }
  
  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendanceSummary(selectedEmployee);
    }
  }, [selectedMonth, selectedEmployee]);

  const handleBackToList = () => {
    setSelectedEmployee(null);
    setEditableEmployee(null);
    // Optional: clear the query param from URL
    window.history.pushState({}, '', '/dashboard/staff');
    setPaySummary(null); // Clear pay summary when going back to list
  }

  const exportEmployeeAttendance = (period: ExportPeriod) => {
    if (!selectedEmployee) return;

    const now = today;
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "CurrentMonth":
        startDate = startOfMonth(calendarMonth);
        endDate = endOfMonth(calendarMonth);
        break;
      case "MonthToDate":
        startDate = startOfMonth(now);
        break;
    }

    const headers = ["Date", "Status", "Check-in Time", "Check-out Time", "Working Hours"];
    const rows: string[] = [];

    const employeeRecords = attendanceRecords.get(selectedEmployee.id) || [];
    const filteredRecords = employeeRecords.filter((rec: AttendanceRecord) => {
      const recDate = new Date(rec.date);
      return recDate >= startDate && recDate <= endDate;
    });

    // Sort records by date
    filteredRecords.sort((a: AttendanceRecord, b: AttendanceRecord) => new Date(a.date).getTime() - new Date(b.date).getTime());

    filteredRecords.forEach((rec: AttendanceRecord) => {
      const workingHours = calculateHours(rec.checkInTime, rec.checkOutTime ?? '--:--');
      rows.push([
        rec.date,
        rec.status,
        rec.checkInTime,
        rec.checkOutTime ?? '--:--',
        workingHours
      ].join(','));
    });

    if (rows.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: `There is no attendance data for ${selectedEmployee.name} in the selected period.`,
      });
      return;
    }
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${selectedEmployee.name.replace(/\s+/g, '_')}_${period}_${format(now, "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Attendance data for ${selectedEmployee.name} has been exported.`,
    });
  };
  
  const handleSaveEmployeeDetails = async () => {
    if (editableEmployee) {
      try {
        await updateEmployee(editableEmployee); // Use updateEmployee from useData hook
        toast({
          title: "Employee Details Updated",
          description: `${editableEmployee.name}'s information has been saved.`,
        });
        // The refreshData is called inside updateEmployee in use-database.tsx
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Saving Changes",
          description: "Failed to update employee details. Please try again.",
        });
      }
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.role || !newStaff.gender || !newStaff.birthday) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    // Generate unique ID by finding the highest existing ID and adding 1
    const maxId = Math.max(...employees.map(emp => parseInt(emp.id) || 0));
    const newId = (maxId + 1).toString();

    const newEmployee: Employee = {
      id: newId,
      name: newStaff.name,
      role: newStaff.role,
      gender: newStaff.gender as "Male" | "Female",
      experience: newStaff.experience || 0,
      phone: newStaff.phone || "",
      birthday: newStaff.birthday,
      employed: newStaff.employed || true,
      avatarUrl: `https://picsum.photos/seed/${newStaff.name.toLowerCase().replace(/\s+/g, '')}/100/100`,
      hourlyPayRate: newStaff.hourlyPayRate || undefined,
      trackAttendance: newStaff.trackAttendance ?? true,
      ptoDays: 10, // Default PTO days for new employees
    };

    try {
      await addEmployee(newEmployee); // Use addEmployee from useData hook
      setIsAddStaffModalOpen(false);
      setNewStaff({ employed: true, experience: 0 });
      toast({
        title: "Staff Added",
        description: `${newEmployee.name} has been added to the staff list.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Adding Staff",
        description: "Failed to add new staff member. Please try again.",
      });
    }
  };

  const handleStatusChange = (employeeId: string, isAbsent: boolean) => {
    setDailyRecords(prev => {
      const newRecords = new Map(prev);
      const record = newRecords.get(employeeId);
      if (record) {
        if (isAbsent) {
          record.status = 'Absent';
          record.checkInTime = '--:--';
          record.checkOutTime = '--:--';
        } else {
            if (record.checkInTime && record.checkInTime !== '--:--') {
                const checkInDate = parse(record.checkInTime, 'HH:mm', today);
                const elevenAm = parse('11:00', 'HH:mm', today);
                record.status = isBefore(checkInDate, elevenAm) || checkInDate.getTime() === elevenAm.getTime() ? 'Present' : 'Late';
            } else {
                record.status = 'Not Marked';
            }
        }
      }
      return newRecords;
    });
  };

  const handleTimeChange = (employeeId: string, type: 'checkIn' | 'checkOut', time: string) => {
    setDailyRecords(prev => {
        const newRecords = new Map(prev);
        const record = newRecords.get(employeeId);
        if (record) {
            if (type === 'checkIn') {
                record.checkInTime = time;
                if (time) {
                    const checkInDate = parse(time, 'HH:mm', today);
                    const elevenAm = parse('11:00', 'HH:mm', today);
                    record.status = isBefore(checkInDate, elevenAm) || checkInDate.getTime() === elevenAm.getTime() ? 'Present' : 'Late';
                } else {
                    record.status = record.checkOutTime && record.checkOutTime !== '--:--' ? 'Not Marked' : 'Not Marked';
                    if (!record.checkOutTime || record.checkOutTime === '--:--') record.status = 'Not Marked';
                }
            } else {
                record.checkOutTime = time;
                if (!record.checkInTime || record.checkInTime === '--:--') {
                    record.status = 'Not Marked';
                }
            }
        }
        return newRecords;
    });
};

  const saveDayAttendance = () => {
    const selectedDate = today;
    if (isHoliday) {
       if (!holidayName.trim()) {
        toast({
          variant: "destructive",
          title: "Missing Holiday Name",
          description: "Please enter a name for the holiday.",
        });
        return;
      }
      addHoliday({ date: format(selectedDate, "yyyy-MM-dd"), name: holidayName });
       toast({
        title: "Holiday Saved",
        description: `${holidayName} has been added.`,
      });
    } else {
      for (const record of dailyRecords.values()) {
          if (record.status !== 'Absent' && record.status !== 'Not Marked') {
              if (record.checkInTime !== '--:--' && (!record.checkOutTime || record.checkOutTime === '--:--')) {
                  toast({
                      variant: "destructive",
                      title: "Missing Check-out Time",
                      description: `Please enter a check-out time for ${record.employeeName}.`,
                  });
                  return;
              }
          }
      }

      dailyRecords.forEach((record, employeeId) => {
        if (record.status === 'Not Marked') return;
        const employeeRecords = attendanceRecords.get(employeeId) || [];
        const recordIndex = employeeRecords.findIndex((r: AttendanceRecord) => r.date === todayStr);
        if (recordIndex > -1) {
          employeeRecords[recordIndex] = record;
        } else {
          employeeRecords.push(record);
        }
        attendanceRecords.set(employeeId, employeeRecords);
      });
      
      toast({
        title: "Attendance Saved",
        description: `Attendance for today has been updated.`,
      });
    }
    
    triggerStorageEvent();
    setIsAttendanceModalOpen(false);
    setIsHoliday(false);
    setHolidayName("");
  };

  const calendarDays = useMemo(() => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfMonth = getDay(start);
    
    const placeholders = Array.from({ length: firstDayOfMonth }, (_, i) => new Date(0, 0, i));
    return [...placeholders, ...days];
  }, [calendarMonth]);

  const getEmployeeDayStatus = useCallback((day: Date, employeeId: string) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const holiday = holidays.find(h => h.date === dateStr);
    if (holiday) return { status: 'Present' as const, holiday: holiday.name, checkIn: '', checkOut: ''};
    
    if (getDay(day) === 0) return null;

    const allEmpRecords = attendanceRecords.get(employeeId) || [];
    const record = allEmpRecords.find((r: AttendanceRecord) => r.date === dateStr);
    
    if(record) {
      return { status: record.status, checkIn: record.checkInTime, checkOut: record.checkOutTime ?? '--:--' };
    }

    if (isBefore(day, today) || isToday(day)) {
      return { status: 'Not Marked' as const, checkIn: '', checkOut: '' };
    }
    
    return null;
  }, []);

  const filteredEmployees = useMemo(() => {
    switch (employeeFilter) {
      case "current":
        return employees.filter(e => e.employed);
      case "not_employed":
        return employees.filter(e => !e.employed);
      case "all":
        return employees;
    }
  }, [employees, employeeFilter]);

  const handleSort = (column: keyof Employee) => {
    setSortDirection(prevDirection => (
      sortColumn === column ? (prevDirection === 'asc' ? 'desc' : 'asc') : 'asc'
    ));
    setSortColumn(column);
  };

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].map(employee => {
    const empRecords = attendanceRecords.get(employee.id) || [];
    const record = empRecords.find((r: AttendanceRecord) => r.date === todayStr);
      const isTodayRecord = record && record.date === todayStr;
      const isHolidayToday = holidays.some(h => h.date === todayStr);

      let status: AttendanceStatus | "Not Employed" | "Remote" = "Not Marked";
      if (!employee.employed) {
        status = "Not Employed";
      } else if (employee.role === 'Owner') {
        status = 'Remote';
      } else if (isHolidayToday) {
        status = "Present";
      } else if (isTodayRecord) {
        status = record.status;
      }
      return { ...employee, status };
    }).sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      // Fallback for other types or if values are not comparable
      return 0;
    });
  }, [filteredEmployees, sortColumn, sortDirection, attendanceRecords, holidays, todayStr]);


  if (selectedEmployee && editableEmployee) {
    const isNextMonthDisabled = getYear(calendarMonth) === getYear(today) && getMonth(calendarMonth) >= getMonth(today);
    const isPrevMonthDisabled = false; // You might want to define the earliest selectable month
    
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBackToList}>
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold font-headline">Employee Details</h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 flex flex-col items-center justify-center p-6">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={selectedEmployee.avatarUrl} alt={selectedEmployee.name} data-ai-hint="person profile" />
              <AvatarFallback className="text-5xl">{selectedEmployee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{selectedEmployee.name}</h2>
            <p className="text-muted-foreground">{selectedEmployee.role}</p>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Employee Information</CardTitle>
                <CardDescription>Edit employee details below.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
               <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Name</Label>
                  <Input 
                    value={editableEmployee.name} 
                    onChange={(e) => setEditableEmployee({...editableEmployee, name: e.target.value})}
                    className="col-span-2"
                  />
               </div>
               <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Role</Label>
                  <Input 
                    value={editableEmployee.role} 
                    onChange={(e) => setEditableEmployee({...editableEmployee, role: e.target.value})}
                    className="col-span-2"
                  />
               </div>
               <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Gender</Label>
                  <Input 
                    value={editableEmployee.gender} 
                    onChange={(e) => setEditableEmployee({...editableEmployee, gender: e.target.value as "Male" | "Female"})}
                    className="col-span-2"
                  />
               </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Birthday</Label>
                  <Input 
                    type="date"
                    value={editableEmployee.birthday} 
                    onChange={(e) => setEditableEmployee({...editableEmployee, birthday: e.target.value})}
                    className="col-span-2"
                  />
               </div>
               <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Experience</Label>
                   <Input 
                    type="number"
                    value={editableEmployee.experience} 
                    onChange={(e) => setEditableEmployee({...editableEmployee, experience: parseInt(e.target.value) || 0})}
                    className="col-span-2"
                  />
               </div>
               <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Phone</Label>
                  <Input 
                    value={editableEmployee.phone} 
                    onChange={(e) => setEditableEmployee({...editableEmployee, phone: e.target.value})}
                    className="col-span-2"
                  />
               </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Employed</Label>
                  <Switch
                    checked={editableEmployee.employed}
                    onCheckedChange={(checked) => setEditableEmployee({...editableEmployee, employed: checked})}
                    className="col-span-2"
                  />
               </div>
               <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right">Track Attendance</Label>
                <Switch
                  checked={editableEmployee.trackAttendance}
                  onCheckedChange={(checked) => setEditableEmployee({...editableEmployee, trackAttendance: checked})}
                  className="col-span-2"
                />
               </div>
               {isAdmin && (
                 <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-right">Annual PTO Days</Label>
                     <Input 
                      type="number"
                      value={editableEmployee.ptoDays} 
                      onChange={(e) => setEditableEmployee({...editableEmployee, ptoDays: parseInt(e.target.value) || 0})}
                      className="col-span-2"
                    />
                 </div>
               )}
               <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right">Today's Status</Label>
                <div className="col-span-2">
                   {holidays.some(h => h.date === todayStr) ? <StatusBadge status="Present" /> : (() => {
                     const empRecords = attendanceRecords.get(selectedEmployee.id) || [];
                     const todayRecord = empRecords.find((r: AttendanceRecord) => r.date === todayStr);
                     return todayRecord ? (
                       <StatusBadge status={todayRecord.status} />
                     ) : (
                       <StatusBadge status={"Not Marked"} />
                     );
                   })()}
                </div>
               </div>
               {isAdmin && (editableEmployee.role === 'TSE' || editableEmployee.role === 'Logistics' || editableEmployee.role === 'MIS') && (
                 <div className="grid grid-cols-3 items-center gap-4">
                   <Label className="text-right">Daily Pay Rate (INR)</Label>
                   <Input 
                     type="number"
                     value={editableEmployee.hourlyPayRate ? (editableEmployee.hourlyPayRate * 8) : ''}
                     onChange={(e) => setEditableEmployee({...editableEmployee, hourlyPayRate: (parseFloat(e.target.value) / 8) || undefined})}
                     className="col-span-2"
                     placeholder="e.g., 2000"
                   />
                 </div>
               )}
            </CardContent>
             <CardFooter className="justify-end">
                <Button onClick={handleSaveEmployeeDetails}>Save Changes</Button>
            </CardFooter>
          </Card>
        </div>
        { selectedEmployee.role !== 'Owner' && (
          <>
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Attendance Summary</CardTitle>
                    <Select 
                      value={format(selectedMonth, 'yyyy-MM')}
                      onValueChange={(value) => {
                        const [year, month] = value.split('-').map(Number);
                        setSelectedMonth(new Date(year, month - 1, 1));
                      }}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue>
                          {format(selectedMonth, 'MMMM yyyy')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: today.getMonth() - 5 }, (_, i) => {
                          // Start from July 2025 (month index 6)
                          const date = new Date(2025, 6 + i, 1);
                          return (
                            <SelectItem key={i} value={format(date, 'yyyy-MM')}>
                              {format(date, 'MMMM yyyy')}
                            </SelectItem>
                          );
                        }).reverse()}
                      </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {!mtdSummary || !ytdSummary ? <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
                        <div className="space-y-4">
                        <div>
                            <div className="grid grid-cols-7 gap-2 text-center">
                                <div><p className="font-bold">{mtdSummary.workDays}</p><p className="text-xs text-muted-foreground">Work Days</p></div>
                                <div><p className="font-bold text-green-600">{mtdSummary.present}</p><p className="text-xs text-muted-foreground">Present</p></div>
                                <div><p className="font-bold text-orange-500">{mtdSummary.lateDays}</p><p className="text-xs text-muted-foreground">Late</p></div>
                                <div><p className="font-bold text-red-500">{mtdSummary.absent}</p><p className="text-xs text-muted-foreground">Absent</p></div>
                                <div><p className="font-bold">{mtdSummary.annualPTODays}</p><p className="text-xs text-muted-foreground">Annual PTO Days</p></div>
                                <div><p className="font-bold text-yellow-600">{mtdSummary.ptoUsedSoFar}</p><p className="text-xs text-muted-foreground">PTO Used So Far</p></div>
                                <div><p className="font-bold">{mtdSummary.ptoLeft}</p><p className="text-xs text-muted-foreground">PTO Left</p></div>
                            </div>
                        </div>
                        {mtdSummary.ptoLeft === 0 && (
                          <p className="text-sm text-orange-500 font-semibold mt-2">
                            Additional days of absence will result in a deduction from pay.
                          </p>
                        )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {isAdmin && paySummary && (
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Pay Summary </CardTitle>
                  <Select 
                    value={format(selectedMonth, 'yyyy-MM')}
                    onValueChange={(value) => {
                      const [year, month] = value.split('-').map(Number);
                      setSelectedMonth(new Date(year, month - 1, 1));
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue>
                        {format(selectedMonth, 'MMMM yyyy')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: today.getMonth() - 5 }, (_, i) => {
                        // Start from July 2025 (month index 6)
                        const date = new Date(2025, 6 + i, 1);
                        return (
                          <SelectItem key={i} value={format(date, 'yyyy-MM')}>
                            {format(date, 'MMMM yyyy')}
                          </SelectItem>
                        );
                      }).reverse()}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Present Days:</span>
                      <span className="font-bold text-green-600">{paySummary.totalPresentDays} days</span>
                    </div>
                    {paySummary.lateDays > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Late Days:</span>
                        <span className="font-bold text-yellow-600">{paySummary.lateDays} days</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Absent Days:</span>
                      <span className="font-bold text-red-500">{paySummary.totalAbsentDays} days</span>
                    </div>
                    {paySummary.ptoUsedThisMonth > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PTO Days Used:</span>
                        <span className="font-bold text-yellow-600">{paySummary.ptoUsedThisMonth} days</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-semibold">Net Payable Days:</span>
                      <span className="font-bold">{paySummary.netPayableDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Pay Rate:</span>
                      <span className="font-bold">₹{((selectedEmployee.hourlyPayRate || 0) * 8).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Gross Pay:</span>
                      <span>₹{paySummary.grossPay.toFixed(2)}</span>
                    </div>
                    {paySummary.ptoDaysLeft === 0 && (
                      <p className="text-sm text-orange-500 font-semibold mt-2">
                        Further absences will reduce pay.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
           
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline">{selectedEmployee.name}'s Attendance</CardTitle>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => exportEmployeeAttendance("CurrentMonth")}>Current Month</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportEmployeeAttendance("MonthToDate")}>Month to Date</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="icon" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} disabled={isPrevMonthDisabled}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} disabled={isNextMonthDisabled}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold text-center mb-4">{format(calendarMonth, 'MMMM yyyy')}</h3>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map(day => (
                    <div key={day} className="text-center font-semibold text-muted-foreground text-sm">{day}</div>
                  ))}
                  {calendarDays.map((day, index) => {
                     if(day.getTime() === new Date(0,0,index).getTime()) return <div key={index}></div>;
                     const dayStatus = getEmployeeDayStatus(day, selectedEmployee.id);
                     const isBirthday = editableEmployee.birthday && format(new Date(editableEmployee.birthday), 'MM-dd') === format(day, 'MM-dd');
                    return (
                      <div 
                        key={day.toISOString()}
                        className={cn(
                          "border rounded-md p-2 h-28 flex flex-col justify-between text-sm overflow-hidden",
                           dayStatus?.status === 'Present' && 'bg-green-100 dark:bg-green-900/50',
                           dayStatus?.status === 'Late' && 'bg-yellow-100 dark:bg-yellow-900/50',
                           dayStatus?.status === 'Absent' && 'bg-red-100 dark:bg-red-900/50',
                           getDay(day) === 0 && 'bg-muted/50',
                           dayStatus?.holiday && 'bg-blue-100 dark:bg-blue-900/50'
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-semibold">{format(day, 'd')}</div>
                          {isBirthday && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Cake className="h-5 w-5 text-pink-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Happy Birthday {editableEmployee.name}!</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        {dayStatus && (
                          <div className="text-xs text-center space-y-1">
                            {dayStatus.holiday && <Badge variant="secondary" className="bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs whitespace-normal">{dayStatus.holiday}</Badge>}
                            {(dayStatus.status === 'Present' || dayStatus.status === 'Late') && dayStatus.checkIn && dayStatus.checkIn !== '--:--' && (
                                <div className="text-gray-600 dark:text-gray-300">
                                    <p>{dayStatus.checkIn} - {dayStatus.checkOut}</p>
                                    <p className="text-xs mt-1">Hours: {calculateHours(dayStatus.checkIn, dayStatus.checkOut)}</p>
                                </div>
                            )}
                            {dayStatus.status && !dayStatus.holiday && <StatusBadge status={dayStatus.status} />}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Spacing after attendance section */}
            <div className="h-12"></div>
          </>
        )}
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
        <div className="h-[600px] bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-headline">Staff</h1>
            <div className="flex gap-4">
              <Button onClick={() => setIsAddStaffModalOpen(true)}>Add Staff</Button>
              <Select value={employeeFilter} onValueChange={(value) => setEmployeeFilter(value as EmployeeFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="not_employed">Not Employed</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        Employee
                        {sortColumn === 'name' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort('role')}>
                      <div className="flex items-center">
                        Role
                        {sortColumn === 'role' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Today's Status
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEmployees.map((employee) => {
    const empRecords = attendanceRecords.get(employee.id) || [];
    const record = empRecords.find((r: AttendanceRecord) => r.date === todayStr);
                    const isTodayRecord = record && record.date === todayStr;
                    const isHolidayToday = holidays.some(h => h.date === todayStr);

                    let status: AttendanceStatus | "Not Employed" | "Remote" = "Not Marked";
                     if (!employee.employed) {
                        status = "Not Employed";
                     } else if (employee.role === 'Owner') {
                        status = 'Remote';
                     } else if (isHolidayToday) {
                        status = "Present";
                    } else if(isTodayRecord) {
                        status = record.status;
                    }

                    return (
                        <TableRow key={employee.id} onClick={() => handleEmployeeClick(employee)} className="cursor-pointer">
                        <TableCell>
                            <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="person portrait" />
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{employee.name}</div>
                            </div>
                            </div>
                        </TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>
                          {employee.status === 'Not Employed' ? <Badge variant="outline">Not Employed</Badge> : (employee.status === 'Remote' ? <Badge variant="secondary">Remote</Badge> : <StatusBadge status={employee.status} />)}
                        </TableCell>
                        </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
       {isAttendanceModalOpen && (
         <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Attendance for {format(today, "MMMM d, yyyy")}</DialogTitle>
            </DialogHeader>
             <div className="flex items-center space-x-2">
                <Checkbox id="is-holiday-main" checked={isHoliday} onCheckedChange={(checked) => setIsHoliday(!!checked)} />
                <Label htmlFor="is-holiday-main">Mark as Holiday</Label>
            </div>
            {isHoliday && (
                <div className="grid gap-2">
                    <Label htmlFor="holiday-name-main">Holiday Name</Label>
                    <Input id="holiday-name-main" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} placeholder="e.g. National Day"/>
                </div>
            )}
            <div className={cn("max-h-[60vh] overflow-y-auto", isHoliday && "opacity-50 pointer-events-none")}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Number of Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(dailyRecords.values()).map(record => (
                    <TableRow key={record.employeeId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={employees.find(e => e.id === record.employeeId)?.avatarUrl} alt={record.employeeName} data-ai-hint="person portrait" />
                            <AvatarFallback>{record.employeeName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{record.employeeName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="time" 
                          value={record.checkInTime}
                          onChange={(e) => handleTimeChange(record.employeeId, 'checkIn', e.target.value)}
                          disabled={record.status === 'Absent' || isHoliday}
                          className="w-32"
                        />
                      </TableCell>
                       <TableCell>
                        <Input 
                          type="time" 
                          value={record.checkOutTime || ''}
                          onChange={(e) => handleTimeChange(record.employeeId, 'checkOut', e.target.value)}
                          disabled={record.status === 'Absent' || isHoliday}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={record.status} />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                           checked={record.status === 'Absent'}
                           onCheckedChange={(checked) => handleStatusChange(record.employeeId, !!checked)}
                           disabled={isHoliday}
                        />
                      </TableCell>
                      <TableCell>
                        {calculateHours(record.checkInTime, record.checkOutTime ?? '--:--')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAttendanceModalOpen(false)}>Cancel</Button>
              <Button onClick={saveDayAttendance}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffModalOpen} onOpenChange={setIsAddStaffModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newStaff.name || ''}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Input
                id="role"
                value={newStaff.role || ''}
                onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">Gender</Label>
              <Select
                value={newStaff.gender}
                onValueChange={(value) => setNewStaff({...newStaff, gender: value as "Male" | "Female"})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birthday" className="text-right">Date of Birth</Label>
              <Input
                id="birthday"
                type="date"
                value={newStaff.birthday || ''}
                onChange={(e) => setNewStaff({...newStaff, birthday: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience" className="text-right">Experience</Label>
              <Input
                id="experience"
                type="number"
                value={newStaff.experience || 0}
                onChange={(e) => setNewStaff({...newStaff, experience: parseInt(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input
                id="phone"
                value={newStaff.phone || ''}
                onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employed" className="text-right">Employed</Label>
              <div className="col-span-3">
                <Switch
                  id="employed"
                  checked={newStaff.employed}
                  onCheckedChange={(checked) => setNewStaff({...newStaff, employed: checked})}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackAttendance" className="text-right">Track Attendance</Label>
              <div className="col-span-3">
                <Switch
                  id="trackAttendance"
                  checked={newStaff.trackAttendance ?? true}
                  onCheckedChange={(checked) => setNewStaff({...newStaff, trackAttendance: checked})}
                />
              </div>
            </div>
            {isAdmin && (newStaff.role === 'TSE' || newStaff.role === 'Logistics' || newStaff.role === 'MIS') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hourlyPayRate" className="text-right">Daily Pay Rate (INR)</Label>
                <Input
                  id="hourlyPayRate"
                  type="number"
                  value={newStaff.hourlyPayRate ? (newStaff.hourlyPayRate * 8) : ''}
                  onChange={(e) => setNewStaff({...newStaff, hourlyPayRate: (parseFloat(e.target.value) / 8) || undefined})}
                  className="col-span-3"
                  placeholder="e.g., 2000"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStaffModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spacing after bottom menu */}
      <div className="h-16"></div>
    </>
  );
}


export default function StaffPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <StaffPageContent />
    </React.Suspense>
  );
}

