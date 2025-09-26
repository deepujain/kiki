
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  AttendanceRecord,
  AttendanceStatus,
  Employee,
} from "@/lib/types";
import { useRouter } from 'next/navigation';
import { useData } from "@/hooks/use-database";
import { format, isBefore, isToday, parse, differenceInMinutes, getDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

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
import { UserCheck, UserX, Clock, Users, ArrowUpDown } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Leaderboard } from "@/components/leaderboard";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

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
  const { employees, attendanceRecords, holidays, todayAttendance, addHoliday, updateAttendance, isLoading: dataLoading, refreshData, currentDateStr } = useData();
  const { toast } = useToast();

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [dailyRecords, setDailyRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [isDashboardLoaded, setIsDashboardLoaded] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof Employee | 'status' | 'checkInTime' | 'checkOutTime'>('status');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter employees for display in dashboard
  const activeEmployees = useMemo(() => {
    return employees.filter(e => e.employed && e.role !== 'Founder & CEO'); // Keep using role until database is updated
  }, [employees]);

  // Filter employees whose attendance is tracked (TSE, Logistics, and MIS)
  const attendanceTrackedEmployees = useMemo(() => {
    return employees.filter(e => e.employed && e.trackAttendance && (e.role === 'TSE' || e.role === 'Logistics' || e.role === 'MIS')); // Keep using role until database is updated
  }, [employees]);

  useEffect(() => {
    if (!dataLoading) {
      setIsDashboardLoaded(true);
    }
  }, [dataLoading]);

  
  const triggerStorageEvent = () => {
    window.dispatchEvent(new Event('storage'));
  }

  const stats = useMemo(() => {
    const counts = { Present: 0, Late: 0, Absent: 0 };
    let notMarked = 0;
    
    attendanceTrackedEmployees.forEach(emp => {
        const record = todayAttendance.get(emp.id);
        if (record && record.date === currentDateStr) {
          if (record.status === 'Present' || record.status === 'Late') {
            counts[record.status]++;
          } else if (record.status === 'Absent') {
            counts.Absent++;
          }
        } else if (!holidays.some(h => h.date === currentDateStr) && getDay(new Date(currentDateStr)) !== 0) {
          notMarked++;
        }
    });
    
    if (holidays.some(h => h.date === currentDateStr)) {
        return { Present: attendanceTrackedEmployees.length, Late: 0, Absent: 0 };
    }

    return { ...counts, Absent: counts.Absent + notMarked };
  }, [activeEmployees, todayAttendance, holidays, currentDateStr]);

  const handleSort = (column: keyof Employee | 'status' | 'checkInTime' | 'checkOutTime') => {
    setSortDirection(prevDirection => (
      sortColumn === column ? (prevDirection === 'asc' ? 'desc' : 'asc') : 'asc'
    ));
    setSortColumn(column);
  };

  const sortedAttendance = useMemo(() => {
    // Combine employee data with their today's attendance record for sorting
    const data = attendanceTrackedEmployees.map(employee => {
      const record = todayAttendance.get(employee.id);
      const isTodayRecord = record && record.date === currentDateStr;
      const isHolidayToday = holidays.some(h => h.date === currentDateStr);

      let status: AttendanceStatus = "Not Marked";
      if (isHolidayToday) {
        status = "Present";
      } else if (isTodayRecord) {
        status = record.status;
      }
      return { ...employee, status, checkInTime: record?.checkInTime || '--:--', checkOutTime: record?.checkOutTime || '--:--' };
    });

    return data.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } 
      // For numeric sorting (e.g., if we had a numeric column to sort)
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [attendanceTrackedEmployees, todayAttendance, holidays, currentDateStr, sortColumn, sortDirection]);

  const handleEmployeeClick = (employee: Employee) => {
    router.push(`/dashboard/staff?employeeId=${employee.id}`);
  }

  const handleNotMarkedClick = () => {
    // Use currentDateStr for the day string
    const dayStr = currentDateStr;
    const existingHoliday = holidays.find(h => h.date === dayStr);

    if (existingHoliday) {
      toast({
        title: "Holiday",
        description: `Today is marked as ${existingHoliday.name}.`,
      });
      return;
    }

    const records = new Map<string, AttendanceRecord>();
    attendanceTrackedEmployees.forEach(emp => {
      const allEmpRecords = attendanceRecords.get(emp.id) || [];
      const dayRecord = allEmpRecords.find(r => r.date === currentDateStr);
      
      if (dayRecord) {
        records.set(emp.id, {...dayRecord});
      } else {
        records.set(emp.id, {
          employeeId: emp.id,
          employeeName: emp.name,
          date: currentDateStr,
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
                const checkInDate = parse(record.checkInTime, 'HH:mm', new Date(currentDateStr)); // Use currentDateStr
                const elevenAm = parse('11:00', 'HH:mm', new Date(currentDateStr)); // Use currentDateStr
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
                    const checkInDate = parse(time, 'HH:mm', new Date(currentDateStr)); // Use currentDateStr
                    const elevenAm = parse('11:00', 'HH:mm', new Date(currentDateStr)); // Use currentDateStr
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
    // Use currentDateStr for the selectedDate
    const selectedDate = new Date(currentDateStr);

    try {
      if (isHoliday) {
        if (!holidayName.trim()) {
          toast({
            variant: "destructive",
            title: "Missing Holiday Name",
            description: "Please enter a name for the holiday.",
          });
          return;
        }
        await addHoliday({ date: currentDateStr, name: holidayName }); // Use currentDateStr
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

          for (const record of dailyRecords.values()) {
              if (record.status === 'Not Marked') continue;
              await updateAttendance(record);
          }
          
          toast({
            title: "Attendance Saved",
            description: `Attendance for today has been updated.`,
          });
      }
      // Refresh data after saving to ensure UI reflects latest database state
      await refreshData();
      setIsAttendanceModalOpen(false);
      setIsHoliday(false);
      setHolidayName("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Saving Changes",
        description: "Failed to save changes. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {dataLoading && (
        <div className="flex flex-col gap-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
          <div className="h-[600px] bg-muted animate-pulse rounded"></div>
        </div>
      )}
      {!dataLoading && (
        <>
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
                <div className="text-2xl font-bold">{activeEmployees.length}</div>
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
              <CardTitle className="font-headline">Today's Attendance - {(() => {
                const [year, month, day] = currentDateStr.split('-').map(Number);
                const displayDate = new Date(year, month - 1, day);
                return format(displayDate, "MMMM d, yyyy");
              })()}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        Employee
                        {sortColumn === 'name' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort('status')}>
                      <div className="flex items-center">
                        Status
                        {sortColumn === 'status' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort('checkInTime')}>
                      <div className="flex items-center">
                        Check-in
                        {sortColumn === 'checkInTime' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort('checkOutTime')}>
                      <div className="flex items-center">
                        Check-out
                        {sortColumn === 'checkOutTime' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort('role')}>
                      <div className="flex items-center">
                        Designation
                        {sortColumn === 'role' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAttendance.map((employee) => {
                    const record = todayAttendance.get(employee.id);
                    const isTodayRecord = record && record.date === currentDateStr; // Use currentDateStr
                    const isHolidayToday = holidays.some(h => h.date === currentDateStr); // Use currentDateStr

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
                              <AvatarImage src={employees.find(e => e.id === employee.id)?.avatarUrl} alt={employee.name} data-ai-hint="person portrait" />
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
                        <TableCell>{employee.role}</TableCell> {/* Keep using role until database is updated */}
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
                  <DialogTitle>Attendance for {format(new Date(currentDateStr), "MMMM d, yyyy")}</DialogTitle>
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
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAttendanceModalOpen(false)}>Cancel</Button>
                  <Button onClick={saveDayAttendance}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}
