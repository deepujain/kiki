"use client";

import React, { useMemo } from 'react';
import { format, parse, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceRecord, Employee } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface MonthlyStats {
  month: string;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  ptosUsed: number;
  grossPay: number;
}

interface Props {
  employee: Employee;
  attendanceRecords: AttendanceRecord[];
}

export function EmployeeMonthlyStats({ employee, attendanceRecords }: Props) {
  // Get last 12 months
  const monthRange = useMemo(() => {
    const end = new Date("2025-09-15"); // Fixed current date
    const start = subMonths(end, 11); // Get 12 months including current
    return eachMonthOfInterval({ start, end });
  }, []);

  const monthlyStats = useMemo(() => {
    return monthRange.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthStr = format(month, 'MMM yyyy');

      // Filter records for this month
      const monthRecords = attendanceRecords.filter(record => {
        const recordDate = parse(record.date, 'yyyy-MM-dd', new Date());
        return recordDate >= monthStart && recordDate <= monthEnd;
      });

      // Calculate statistics
      const presentDays = monthRecords.filter(r => r.status === 'Present').length;
      const lateDays = monthRecords.filter(r => r.status === 'Late').length;
      const absentDays = monthRecords.filter(r => r.status === 'Absent').length;
      const ptosUsed = 0; // TODO: Add PTO tracking

      // Calculate gross pay
      const totalHours = monthRecords.reduce((sum, record) => {
        if (record.status === 'Absent') return sum;
        if (!record.checkInTime || !record.checkOutTime || 
            record.checkInTime === '--:--' || record.checkOutTime === '--:--') return sum;

        const checkIn = parse(record.checkInTime, 'HH:mm', new Date());
        const checkOut = parse(record.checkOutTime, 'HH:mm', new Date());
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        return sum + Math.min(hours, 8); // Cap at 8 hours per day
      }, 0);

      const hourlyRate = employee.hourlyPayRate || 0;
      const grossPay = totalHours * hourlyRate;

      return {
        month: monthStr,
        presentDays,
        absentDays,
        lateDays,
        ptosUsed,
        grossPay
      };
    });
  }, [monthRange, attendanceRecords, employee.hourlyPayRate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="gross">Gross Pay</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance" className="space-y-4 pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="presentDays" name="Present Days" stroke="#10b981" />
                  <Line type="monotone" dataKey="lateDays" name="Late Days" stroke="#f59e0b" />
                  <Line type="monotone" dataKey="absentDays" name="Absent Days" stroke="#ef4444" />
                  <Line type="monotone" dataKey="ptosUsed" name="PTOs Used" stroke="#8b5cf6" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="gross" className="space-y-4 pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="grossPay" name="Gross Pay (₹)" stroke="#6366f1" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
