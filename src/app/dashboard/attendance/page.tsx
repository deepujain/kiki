"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  AllStatuses,
  AttendanceRecord,
  AttendanceStatus,
  Employee,
} from "@/lib/types";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isFuture, isBefore, differenceInMinutes, parse, startOfQuarter, endOfQuarter, startOfYear, getMonth, getYear } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/hooks/use-database";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Download, Cake } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/status-badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const earliestDate = new Date("2025-03-01T00:00:00");
const latestDate = new Date("2025-09-30T00:00:00");
type ExportPeriod = "CurrentMonth" | "MonthToDate" | "QuarterToDate" | "YearToDate";

const calculateHours = (checkIn: string, checkOut: string): string => {
  if (checkIn === '--:--' || !checkOut || checkOut === '--:--') return '--';
  const checkInDate = parse(checkIn, 'HH:mm', new Date());
  const checkOutDate = parse(checkOut, 'HH:mm', new Date());
  
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate < checkInDate) {
    return '--';
  }
  
  const diffMins = differenceInMinutes(checkOutDate, checkInDate);
  if (diffMins > 8 * 60 + 30) return '9';
  
  return Math.round(diffMins/60).toString();
};

export default function AttendancePage() {
  const { employees = [], attendanceRecords = new Map(), holidays = [], addHoliday, removeHoliday, updateAttendance, updateMultipleAttendance, isLoading } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date("2025-09-15"));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dailyRecords, setDailyRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const { toast } = useToast();
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [isEditingHoliday, setIsEditingHoliday] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // New state for saving status

  const activeEmployees = useMemo(() => {
    return employees.filter(e => e.employed && (e.role === 'TSE' || e.role === 'Logistics' || e.role === 'MIS'));
  }, [employees]);

  const handleStatusChange = (employeeId: string, isAbsent: boolean) => {
    setDailyRecords(prev => {
      const newRecords = new Map(prev);
      const record = newRecords.get(employeeId);
      if (record && selectedDate) {
        if (isAbsent) {
          record.status = 'Absent';
          record.checkInTime = '--:--';
          record.checkOutTime = '--:--';
        } else {
            if (record.checkInTime && record.checkInTime !== '--:--') {
                const checkInDate = parse(record.checkInTime, 'HH:mm', selectedDate);
                const elevenAm = parse('11:00', 'HH:mm', selectedDate);
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
      if (record && selectedDate) {
        if(type === 'checkIn') {
          record.checkInTime = time;
          if (time) {
            const checkInDate = parse(time, 'HH:mm', selectedDate);
            const elevenAm = parse('11:00', 'HH:mm', selectedDate);
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

  const saveDayAttendance = async () => {
    if (!selectedDate) return;
    setIsSaving(true); // Start saving

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      if (isHoliday) {
        if (!holidayName.trim()) {
          toast({
            variant: "destructive",
            title: "Missing Holiday Name",
            description: "Please enter a name for the holiday.",
          });
          setIsSaving(false); // Reset saving state
          return;
        }
        await addHoliday({ date: dateStr, name: holidayName });
        toast({
          title: "Holiday Saved",
          description: `${holidayName} has been added for ${format(selectedDate, "MMMM d, yyyy")}.`,
        });
      } else {
        if (isEditingHoliday) {
          await removeHoliday(dateStr);
          toast({
            title: "Holiday Removed",
            description: `The holiday for ${format(selectedDate, "MMMM d, yyyy")} has been removed.`,
          });
        }
        
        // Validate check-out times before saving
        for (const record of dailyRecords.values()) {
          if (record.status !== 'Absent' && record.status !== 'Not Marked') {
            if (record.checkInTime !== '--:--' && (!record.checkOutTime || record.checkOutTime === '--:--')) {
              toast({
                variant: "destructive",
                title: "Missing Check-out Time",
                description: `Please enter a check-out time for ${record.employeeName}.`,
              });
              setIsSaving(false); // Reset saving state
              return;
            }
          }
        }

        // Filter out 'Not Marked' records and collect all records to be updated
        const recordsToUpdate = Array.from(dailyRecords.values()).filter(record => record.status !== 'Not Marked');
        
        if (recordsToUpdate.length > 0) {
            await updateMultipleAttendance(recordsToUpdate);
        }
        
        if (!isEditingHoliday) {
            toast({
                title: "Attendance Saved",
                description: `Attendance for ${format(selectedDate, "MMMM d, yyyy")} has been updated.`,
            });
        }
      }
    } catch (error) {
      console.error("Error in saveDayAttendance:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Changes",
        description: "Failed to save changes. Please try again.",
      });
    } finally {
      // Reset states AFTER saving and refreshing data
      setSelectedDate(null);
      setIsHoliday(false);
      setHolidayName("");
      setIsEditingHoliday(false);
      setIsSaving(false); // Always reset saving state
    }
  };
  
  const openDayModal = (day: Date) => {
    // Allow editing for current day, one extra day, and past days within the allowed range
    const tomorrow = new Date("2025-09-15");
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (getDay(day) === 0 || (isFuture(day) && !isToday(day) && format(day, 'yyyy-MM-dd') !== format(tomorrow, 'yyyy-MM-dd')) || isBefore(day, startOfMonth(earliestDate))) return;
    
    const dateStr = format(day, 'yyyy-MM-dd');
    const existingHoliday = holidays.find(h => h.date === dateStr);
    
    const initialRecords = new Map<string, AttendanceRecord>();
    activeEmployees.forEach(emp => {
      const empRecords = attendanceRecords.get(emp.id) || [];
      const dayRecord = empRecords.find(r => r.date === dateStr);
      
      if (dayRecord) {
        initialRecords.set(emp.id, {...dayRecord});
      } else {
        initialRecords.set(emp.id, {
          employeeId: emp.id,
          employeeName: emp.name,
          date: dateStr,
          status: 'Not Marked',
          checkInTime: '--:--',
          checkOutTime: '--:--'
        });
      }
    });

    setDailyRecords(initialRecords);
    setSelectedDate(day);

    if (existingHoliday) {
      setIsHoliday(true);
      setHolidayName(existingHoliday.name);
      setIsEditingHoliday(true);
    } else {
      setIsHoliday(false);
      setHolidayName("");
      setIsEditingHoliday(false);
    }
  }

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfMonth = getDay(start);
    
    // Add placeholders for days before the start of the month
    const placeholders = Array.from({ length: firstDayOfMonth }, (_, i) => new Date(0, 0, i));
    return [...placeholders, ...days];
  }, [currentMonth]);

  const getBirthdaysForDay = (day: Date): Employee[] => {
    const dayMonth = format(day, 'MM-dd');
    return activeEmployees.filter(emp => emp.birthday && format(new Date(emp.birthday), 'MM-dd') === dayMonth);
  }

  const getDaySummary = useCallback((day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const holiday = holidays.find(h => h.date === dateStr);

    if (holiday) {
        return { present: activeEmployees.length, absent: 0, late: 0, holiday: holiday.name };
    }
    
    if (getDay(day) === 0) return null; // Sundays are off

    let present = 0;
    let absent = 0;
    let late = 0;

    let recordsFound = false;
    activeEmployees.forEach(emp => {
      const empRecords = attendanceRecords.get(emp.id) || [];
      const record = empRecords.find(r => r.date === dateStr);
      
      if(record) {
        recordsFound = true;
        switch(record.status) {
          case 'Present':
            present++;
            break;
          case 'Late':
            late++;
            break;
          case 'Absent':
            absent++;
            break;
        }
      }
    });
    
    if (recordsFound) {
      return { present, absent, late };
    }

    if (isBefore(day, earliestDate) || isFuture(day)) {
        return null;
    }

    // if no records found for the day, and it's not a future/disabled day, show nothing
    return null; 
    
  }, [activeEmployees, attendanceRecords, holidays]);
  
  const exportToCsv = (period: ExportPeriod) => {
    const now = new Date("2025-09-30"); // Use a fixed date for consistent export periods
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "CurrentMonth":
        startDate = startOfMonth(currentMonth);
        endDate = endOfMonth(currentMonth);
        break;
      case "MonthToDate":
        startDate = startOfMonth(now);
        break;
      case "QuarterToDate":
        startDate = startOfQuarter(now);
        break;
      case "YearToDate":
        startDate = startOfYear(now);
        break;
    }

    const headers = ["Employee ID", "Employee Name", "Date", "Status", "Check-in Time", "Check-out Time"];
    const rows: string[] = [];

    activeEmployees.forEach(emp => {
      const empRecords = attendanceRecords.get(emp.id) || [];
      const filteredRecords = empRecords.filter(rec => {
        const recDate = new Date(rec.date);
        return recDate >= startDate && recDate <= endDate;
      });

      filteredRecords.forEach(rec => {
        rows.push([
          emp.id,
          emp.name,
          rec.date,
          rec.status,
          rec.checkInTime,
          rec.checkOutTime ?? '--:--'
        ].join(','));
      });
    });

    if (rows.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: `There is no attendance data for the selected period.`,
      });
      return;
    }
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${period}_${format(now, "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isNextMonthDisabled = getYear(currentMonth) === getYear(latestDate) && getMonth(currentMonth) >= getMonth(latestDate);
  const isPrevMonthDisabled = getYear(currentMonth) === getYear(earliestDate) && getMonth(currentMonth) <= getMonth(earliestDate);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <div className="h-[600px] bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">Attendance Calendar</h1>
        <div className="flex gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportToCsv("CurrentMonth")}>Current Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCsv("MonthToDate")}>Month to Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCsv("QuarterToDate")}>Quarter to Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCsv("YearToDate")}>Year to Date</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} disabled={isPrevMonthDisabled}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} disabled={isNextMonthDisabled}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center font-semibold text-muted-foreground">{day}</div>
            ))}
            {calendarDays.map((day, index) => {
               if(day.getTime() === new Date(0,0,index).getTime()) return <div key={index}></div>;
               const summary = getDaySummary(day);
               const birthdays = getBirthdaysForDay(day);
               const tomorrow = new Date("2025-09-15");
               tomorrow.setDate(tomorrow.getDate() + 1);
               const isDayFuture = isFuture(day) && !isToday(day) && format(day, 'yyyy-MM-dd') !== format(tomorrow, 'yyyy-MM-dd');
               const isDisabledPast = isBefore(day, startOfMonth(earliestDate));
               const isSunday = getDay(day) === 0;
               const isDayDisabled = isDayFuture || isDisabledPast || isSunday;

              return (
                <div 
                  key={day.toISOString()}
                  onClick={() => !isDayDisabled && openDayModal(day)}
                  className={cn(
                    "border rounded-lg p-2 h-32 flex flex-col justify-between relative",
                    isToday(day) && "bg-primary/10",
                    isSunday && "bg-muted/20 text-muted-foreground cursor-not-allowed",
                    summary?.holiday && "bg-blue-100 dark:bg-blue-900/50 cursor-pointer hover:bg-blue-200/50",
                    !isDayDisabled && "cursor-pointer hover:bg-muted/50",
                    isDayDisabled && !isSunday && "bg-muted/40 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">{format(day, 'd')}</div>
                    {birthdays.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-1">
                               <Cake className="h-5 w-5 text-pink-500" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Happy Birthday {birthdays.map(b => b.name).join(', ')}!</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                   {summary?.holiday && (
                      <div className="flex flex-col items-center justify-center text-center absolute inset-0">
                         <Badge variant="secondary" className="bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-100">{summary.holiday}</Badge>
                      </div>
                   )}
                  {summary && !summary.holiday && (
                    <div className="text-xs text-right space-y-0.5">
                        <p className="text-green-600 font-medium">{summary.present} Present</p>
                        <p className="text-red-600 font-medium">{summary.absent} Absent</p>
                        <p className="text-orange-500 font-medium">{summary.late} Late</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Spacing after monthly calendar */}
      <div className="h-12"></div>

      {selectedDate && (
        <Dialog open={!!selectedDate} onOpenChange={(isOpen) => !isOpen && setSelectedDate(null)}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Attendance for {format(selectedDate, "MMMM d, yyyy")}</DialogTitle>
            </DialogHeader>
             <div className="flex items-center space-x-2">
                <Checkbox id="is-holiday" checked={isHoliday} onCheckedChange={(checked) => setIsHoliday(!!checked)} />
                <Label htmlFor="is-holiday">Mark as Holiday</Label>
            </div>
            {isHoliday && (
                <div className="grid gap-2">
                    <Label htmlFor="holiday-name">Holiday Name</Label>
                    <Input id="holiday-name" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} placeholder="e.g. National Day"/>
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

            {/* Spacing between attendance table and buttons */}
            <div className="h-8"></div>

            {/* Additional spacing before bottom navigation */}
            <div className="h-12"></div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedDate(null)}>Cancel</Button>
              <Button onClick={saveDayAttendance} disabled={isSaving}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Spacing after bottom menu */}
      <div className="h-16"></div>
    </div>
  );
}