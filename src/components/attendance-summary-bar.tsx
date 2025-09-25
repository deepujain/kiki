import { format, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AttendanceRecord } from "@/lib/types";
import { useState } from "react";

interface AttendanceSummaryBarProps {
  employeeName: string;
  month: Date;
  records: AttendanceRecord[];
  holidays: { date: string; name: string; }[];
  showHeaders?: boolean;
  highlightedDate?: string | null;
  onDateHover: (date: string | null) => void;
}

export function AttendanceSummaryBar({ 
  employeeName, 
  month, 
  records, 
  holidays,
  showHeaders = false,
  highlightedDate,
  onDateHover
}: AttendanceSummaryBarProps) {
  // Get all days in the month
  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month)
  });

  return (
    <div className="relative">
      {showHeaders && (
        <div className="flex gap-[5px] mb-2 ml-44">
          {days.map(day => (
            <TooltipProvider key={`header-${day.toISOString()}`}>
              <Tooltip>
                <TooltipTrigger 
                  className="w-8 text-center text-xs text-muted-foreground font-medium hover:text-primary"
                  onMouseEnter={() => onDateHover(format(day, 'yyyy-MM-dd'))}
                  onMouseLeave={() => onDateHover(null)}
                >
                  {format(day, 'd')}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(day, 'MMMM d, yyyy')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="w-40 truncate font-medium">{employeeName}</div>
        <div className="flex-1 flex gap-[5px]">
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const record = records.find(r => r.date === dateStr);
            const holiday = holidays.find(h => h.date === dateStr);
            const isSunday = getDay(day) === 0;
            const today = new Date("2025-09-24"); // Fixed current date
            const isFutureDate = day > today;

            // Determine the status and color
            let status: string;
            let bgColor: string;

            if (isFutureDate) {
              status = "Future date";
              bgColor = "bg-purple-100 dark:bg-purple-900";
            } else if (isSunday) {
              status = "Sunday";
              bgColor = "bg-gray-200 dark:bg-gray-700";
            } else if (day <= today && !record && !holiday) {
              status = "Missing Data";
              bgColor = "bg-pink-200 dark:bg-pink-900";
            } else if (holiday) {
              status = `Holiday: ${holiday.name}`;
              bgColor = "bg-blue-500 dark:bg-blue-600";
            } else if (record) {
              status = record.status;
              switch (record.status) {
                case "Present":
                  bgColor = "bg-green-500 dark:bg-green-600";
                  break;
                case "Late":
                  bgColor = "bg-yellow-500 dark:bg-yellow-600";
                  break;
                case "Absent":
                  bgColor = "bg-red-500 dark:bg-red-600";
                  break;
                default:
                  bgColor = "bg-gray-200 dark:bg-gray-700";
              }
            } else {
              // Missing Data - only for non-Sunday past dates
              status = "Missing Data";
              bgColor = "bg-pink-200 dark:bg-pink-900";
            }

            return (
              <TooltipProvider key={dateStr}>
                <Tooltip>
                  <TooltipTrigger 
                    onMouseEnter={() => onDateHover(dateStr)}
                    onMouseLeave={() => onDateHover(null)}
                  >
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-sm transition-transform duration-150",
                        bgColor,
                        highlightedDate === dateStr && "transform scale-125 shadow-lg"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{format(day, 'EEEE MMMM d yyyy')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    </div>
  );
}