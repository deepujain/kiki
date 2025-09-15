
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  AttendanceRecord,
  AttendanceStatus,
  Employee,
} from "@/lib/types";
import { employees as mockEmployees, updateEmployeeDetails } from "@/lib/data";
import { allTimeAttendanceStore } from "@/lib/store";
import { holidays, addHoliday } from "@/lib/holidays";
import { useRouter } from 'next/navigation';

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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Clock, Users } from "lucide-react";
import {
  format,
  isBefore,
  isToday,
  parse,
  differenceInMinutes,
  getDay,
} from 'date-fns';
import { StatusBadge } from "@/components/status-badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Leaderboard } from "@/components/leaderboard";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginCelebration } from "@/components/login-celebration";

const today = new Date("2025-09-15");
const todayStr = format(today, "yyyy-MM-dd");

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

export default function DashboardPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees.filter(e => e.employed && e.role !== 'Founder & CEO'));
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
  const { toast } = useToast();

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [dailyRecords, setDailyRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [isDashboardLoaded, setIsDashboardLoaded] = useState(false);

  const syncState = useCallback(() => {
    setEmployees([...mockEmployees.filter(e => e.employed && e.role !== 'Founder & CEO')]);
    const todayRecords = new Map<string, AttendanceRecord>();
    const dateStrToUse = isAttendanceModalOpen ? format(today, "yyyy-MM-dd") : todayStr;

    allTimeAttendanceStore.forEach((records, empId) => {
        const recordForDay = records.find(r => r.date === dateStrToUse);
        if (recordForDay) {
            todayRecords.set(empId, recordForDay);
        }
    });
    setAttendance(todayRecords);
  }, [isAttendanceModalOpen]);

  useEffect(() => {
    syncState();
    const interval = setInterval(syncState, 2000); // Check for updates periodically
    window.addEventListener('storage', syncState); 

    // Mark dashboard as loaded after initial sync
    setIsDashboardLoaded(true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncState);
    };
  }, [syncState]);

  // Effect to trigger celebration after dashboard is loaded
  useEffect(() => {
    if (isDashboardLoaded) {
      // Check if we should show the celebration
      const shouldShowCelebration = localStorage.getItem('showLoginCelebration') === 'true';
      if (shouldShowCelebration) {
        // Small delay to ensure smooth transition
        const loadTimer = setTimeout(() => {
          setShowCelebration(true);
          // Remove the flag so it won't show again until next login
          localStorage.removeItem('showLoginCelebration');
        }, 100);
        return () => clearTimeout(loadTimer);
      }
    }
  }, [isDashboardLoaded]);

  // Effect to hide celebration after showing
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);
  
  const triggerStorageEvent = () => {
    window.dispatchEvent(new Event('storage'));
  }

  const stats = useMemo(() => {
    const counts = { Present: 0, Late: 0, Absent: 0 };
    let notMarked = 0;
    
    employees.forEach(emp => {
        const record = attendance.get(emp.id);
        if (record && record.date === todayStr) {
          if (record.status === 'Present' || record.status === 'Late') {
            counts[record.status]++;
          } else if (record.status === 'Absent') {
            counts.Absent++;
          }
        } else if (!holidays.some(h => h.date === todayStr) && getDay(today) !== 0) {
          notMarked++;
        }
    });
    
    if (holidays.some(h => h.date === todayStr)) {
        return { Present: employees.length, Late: 0, Absent: 0 };
    }

    return { ...counts, Absent: counts.Absent + notMarked };
  }, [attendance, employees]);

  const handleEmployeeClick = (employee: Employee) => {
    router.push(`/dashboard/staff?employeeId=${employee.id}`);
  }

  const handleNotMarkedClick = () => {
    const dayStr = format(today, "yyyy-MM-dd");
    const existingHoliday = holidays.find(h => h.date === dayStr);

    if (existingHoliday) {
      toast({
        title: "Holiday",
        description: `Today is marked as ${existingHoliday.name}.`,
      });
      return;
    }

    const records = new Map<string, AttendanceRecord>();
    employees.forEach(emp => {
      const allEmpRecords = allTimeAttendanceStore.get(emp.id) || [];
      const dayRecord = allEmpRecords.find(r => r.date === todayStr);
      
      if (dayRecord) {
        records.set(emp.id, {...dayRecord});
      } else {
        records.set(emp.id, {
          employeeId: emp.id,
          employeeName: emp.name,
          date: todayStr,
          status: 'Not Marked',
          checkInTime: '--:--',
          checkOutTime: '--:--'
        });
      }
    });
    setDailyRecords(records);
    setIsAttendanceModalOpen(true);
    setIsHoliday(false);
    setHolidayName("");
  }
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
            const employeeRecords = allTimeAttendanceStore.get(employeeId) || [];
            const recordIndex = employeeRecords.findIndex(r => r.date === todayStr);
            if (recordIndex > -1) {
                employeeRecords[recordIndex] = record;
            } else {
                employeeRecords.push(record);
            }
            allTimeAttendanceStore.set(employeeId, employeeRecords);
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

  return (
    <div className="flex flex-col gap-6">
      {showCelebration && <LoginCelebration />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.Present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.Late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.Absent}</div>
          </CardContent>
        </Card>
      </div>

      <Leaderboard />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Today's Attendance - {format(today, "MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const record = attendance.get(employee.id);
                const isTodayRecord = record && record.date === todayStr;
                const isHolidayToday = holidays.some(h => h.date === todayStr);

                let status: AttendanceStatus = "Not Marked";
                if (isHolidayToday) {
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
                    <TableCell>
                       <StatusBadge status={status} />
                    </TableCell>
                    <TableCell>
                      {isTodayRecord ? record.checkInTime : "--:--"}
                    </TableCell>
                    <TableCell>
                      {isTodayRecord ? record.checkOutTime ?? "--:--" : "--:--"}
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Spacing after Today's Attendance section */}
      <div className="h-12"></div>
      <div className="h-12"></div>
      
      {isAttendanceModalOpen && (
         <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Attendance for {format(today, "MMMM d, yyyy")}</DialogTitle>
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
                            <AvatarImage src={mockEmployees.find(e => e.id === record.employeeId)?.avatarUrl} alt={record.employeeName} data-ai-hint="person portrait" />
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
    </div>
  );
}
