import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: AttendanceStatus | 'Late' | 'Present' | 'Absent' | 'Not Marked' }) {

  return (
    <Badge
      className={cn(
        "font-semibold text-white",
        status === "Present" && "bg-green-500 hover:bg-green-600",
        status === "Late" && "bg-yellow-500 hover:bg-yellow-600",
        status === "Absent" && "bg-red-500 hover:bg-red-600",
        status === "Not Marked" && "bg-gray-400 hover:bg-gray-500"
      )}
    >
      {status}
    </Badge>
  );
}

    