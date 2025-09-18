
"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startOfMonth, startOfQuarter, startOfYear, endOfDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Crown } from "lucide-react";
import { useData } from "@/hooks/use-database";
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';

type LeaderboardPeriod = "MonthToDate" | "QuarterToDate" | "YearToDate";

interface LeaderboardEntry {
  employeeId: string;
  name: string;
  avatarUrl: string;
  score: number;
}

export function Leaderboard() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("MonthToDate");
  const { employees, attendanceRecords, isLoading } = useData();
  const router = useRouter();

  const leaderboardData = useMemo(() => {
    if (isLoading) return [];

    const now = new Date(); // Use current date
    let startDate: Date;
    const endDate = endOfDay(now);

    switch (period) {
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

    const scores: { [key: string]: number } = {};
    const activeEmployees = employees.filter(emp => emp.employed && emp.role !== 'Founder & CEO');

    activeEmployees.forEach(emp => scores[emp.id] = 0);
    
    attendanceRecords.forEach((records, employeeId) => {
        if (!scores.hasOwnProperty(employeeId)) return; // Only count active employees

        records.forEach(rec => {
            const recDate = new Date(rec.date);
            if (recDate >= startDate && recDate <= endDate) {
                if (rec.status === 'Late') {
                    scores[employeeId] = (scores[employeeId] || 0) + 1;
                }
            }
        });
    });

    const sortedEmployees = activeEmployees
      .map(emp => ({
        employeeId: emp.id,
        name: emp.name,
        avatarUrl: emp.avatarUrl,
        score: scores[emp.id] || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    return sortedEmployees;

  }, [period, employees, attendanceRecords, isLoading]);

  const handleEmployeeClick = (employeeId: string) => {
    router.push(`/dashboard/staff?employeeId=${employeeId}`);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="font-headline">Top 3 Latecomers</CardTitle>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as LeaderboardPeriod)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MonthToDate">Month to Date</SelectItem>
            <SelectItem value="QuarterToDate">Quarter to Date</SelectItem>
            <SelectItem value="YearToDate">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : leaderboardData.length > 0 ? (
          <div className="flex justify-around items-end gap-4">
             {/* Second Place */}
            {leaderboardData.length > 1 && leaderboardData[1].score > 0 && (
              <div className="text-center flex flex-col items-center gap-2 p-4 rounded-lg w-1/3 cursor-pointer hover:bg-muted/50" onClick={() => handleEmployeeClick(leaderboardData[1].employeeId)}>
                <Avatar className="w-20 h-20 border-4 border-gray-400">
                  <AvatarImage src={leaderboardData[1].avatarUrl} />
                  <AvatarFallback>{leaderboardData[1].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-lg font-bold">{leaderboardData[1].name}</div>
                <div className="font-semibold text-gray-400">Silver</div>
                <div className="text-sm text-muted-foreground">{leaderboardData[1].score} Days Late</div>
              </div>
            )}
             {/* First Place */}
            {leaderboardData[0].score > 0 && (
              <div className="text-center flex flex-col items-center gap-2 p-4 rounded-lg w-1/3 relative cursor-pointer hover:bg-muted/50" onClick={() => handleEmployeeClick(leaderboardData[0].employeeId)}>
                  <Crown className="absolute -top-2 text-yellow-500 w-8 h-8" />
                  <Avatar className="w-24 h-24 border-4 border-yellow-500">
                      <AvatarImage src={leaderboardData[0].avatarUrl} />
                      <AvatarFallback>{leaderboardData[0].name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-xl font-bold">{leaderboardData[0].name}</div>
                  <div className="font-semibold text-yellow-500">Gold</div>
                  <div className="text-muted-foreground">{leaderboardData[0].score} Days Late</div>
              </div>
            )}
             {/* Third Place */}
            {leaderboardData.length > 2 && leaderboardData[2].score > 0 && (
              <div className="text-center flex flex-col items-center gap-2 p-4 rounded-lg w-1/3 cursor-pointer hover:bg-muted/50" onClick={() => handleEmployeeClick(leaderboardData[2].employeeId)}>
                <Avatar className="w-20 h-20 border-4 border-yellow-700">
                  <AvatarImage src={leaderboardData[2].avatarUrl} />
                  <AvatarFallback>{leaderboardData[2].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-lg font-bold">{leaderboardData[2].name}</div>
                <div className="font-semibold text-yellow-700">Bronze</div>
                <div className="text-sm text-muted-foreground">{leaderboardData[2].score} Days Late</div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No lates recorded for this period.</p>
        )}
        {leaderboardData.every(e => e.score === 0) && (
            <p className="text-center text-muted-foreground pt-4">Looks like everyone is on time!</p>
        )}
      </CardContent>
    </Card>
  );
}
