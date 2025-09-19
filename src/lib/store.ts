import { AttendanceRecord, AttendanceStatus } from "./types";
import { employees as mockEmployees } from "./data";
import { format, parse, differenceInHours, differenceInMinutes, isBefore } from "date-fns";
import { holidays } from "./holidays";

// Store for today's attendance, initialized from historical data if the day matches.
export const attendanceStore = new Map<string, AttendanceRecord>();

// Store for historical attendance data
export const allTimeAttendanceStore = new Map<string, AttendanceRecord[]>();

const septemberData = {
  Sathish: {
    "01/09/2025": { checkin: "12:08 PM", checkout: "8:15 PM" },
    "02/09/2025": { checkin: "12:01 PM", checkout: "7:39 PM" },
    "03/09/2025": { checkin: "12:48 PM", checkout: "6:17 PM" },
    "04/09/2025": { checkin: "12:16 PM", checkout: "8:48 PM" },
    "05/09/2025": { checkin: "12:49 PM", checkout: "7:39 PM" },
    "06/09/2025": { checkin: "12:26 PM", checkout: "8:26 PM" },
    "07/09/2025": "Sunday",
    "08/09/2025": { checkin: "12:07 PM", checkout: "8:56 PM" },
    "09/09/2025": { checkin: "11:52 AM", checkout: "8:42 PM" },
    "10/09/2025": { checkin: "1:06 PM", checkout: "9:29 PM" },
    "11/09/2025": { checkin: "11:24 AM", checkout: "8:48 PM" },
    "12/09/2025": "Absent",
    "13/09/2025": { checkin: "12:31 PM", checkout: "7:57 PM" },
    "14/09/2025": "Sunday",
    "15/09/2025": { checkin: "11:45 AM", checkout: "7:01 PM" },
  },
  Raghavendra: {
    "01/09/2025": { checkin: "10:47 AM", checkout: "8:07 PM" },
    "02/09/2025": { checkin: "10:58 AM", checkout: "8:39 PM" },
    "03/09/2025": { checkin: "11:09 AM", checkout: "5:44 PM" },
    "04/09/2025": { checkin: "10:47 AM", checkout: "7:26 PM" },
    "05/09/2025": { checkin: "10:54 AM", checkout: "7:56 PM" },
    "06/09/2025": { checkin: "10:57 AM", checkout: "9:10 PM" },
    "07/09/2025": { checkin: "11:27 AM", checkout: "9:23 PM" },
    "08/09/2025": { checkin: "10:53 AM", checkout: "8:25 PM" },
    "09/09/2025": "Absent",
    "10/09/2025": { checkin: "10:53 AM", checkout: "8:45 PM" },
    "11/09/2025": { checkin: "10:47 AM", checkout: "8:40 PM" },
    "12/09/2025": { checkin: "10:40 AM", checkout: "6:00 PM" }, // replaced "HRS"
    "14/09/2025": "Sunday",
    "15/09/2025": { checkin: "11:29 AM", checkout: "8:36 PM" },
  },
  Safee: {
    "01/09/2025": { checkin: "10:54 AM", checkout: "7:16 PM" },
    "02/09/2025": { checkin: "10:18 AM", checkout: "6:56 PM" },
    "03/09/2025": { checkin: "10:41 AM", checkout: "6:13 PM" },
    "04/09/2025": { checkin: "11:00 AM", checkout: "6:22 PM" },
    "05/09/2025": { checkin: "10:46 AM", checkout: "6:15 PM" },
    "06/09/2025": { checkin: "10:25 AM", checkout: "7:11 PM" },
    "07/09/2025": { checkin: "10:01 AM", checkout: "7:17 PM" },
    "08/09/2025": "Absent",
    "09/09/2025": "Absent",
    "10/09/2025": "Absent",
    "11/09/2025": "Absent",
    "12/09/2025": "Absent",
    "14/09/2025": "Sunday",
    "15/09/2025": { checkin: "10:28 AM", checkout: "6:44 PM" },
  },
  Dhiren: {
    "01/09/2025": { checkin: "10:52 AM", checkout: "7:04 PM" },
    "02/09/2025": { checkin: "10:54 AM", checkout: "6:52 PM" },
    "03/09/2025": { checkin: "10:57 AM", checkout: "6:53 PM" },
    "04/09/2025": { checkin: "11:09 AM", checkout: "6:51 PM" },
    "05/09/2025": { checkin: "10:45 AM", checkout: "6:55 PM" },
    "06/09/2025": { checkin: "10:45 AM", checkout: "3:48 PM" },
    "07/09/2025": { checkin: "10:48 AM", checkout: "6:57 PM" },
    "08/09/2025": { checkin: "10:33 AM", checkout: "6:43 PM" },
    "09/09/2025": { checkin: "11:11 AM", checkout: "6:54 PM" },
    "10/09/2025": { checkin: "11:06 AM", checkout: "6:55 PM" },
    "11/09/2025": { checkin: "11:01 AM", checkout: "6:50 PM" },
    "12/09/2025": { checkin: "10:33 AM", checkout: "6:00 PM" }, 
    "14/09/2025": "Sunday",
  },
  Arjun: {
    "01/09/2025": { checkin: "10:11 AM", checkout: "8:06 PM" },
    "02/09/2025": { checkin: "10:00 AM", checkout: "6:00 PM" }, 
    "03/09/2025": { checkin: "10:18 AM", checkout: "8:29 PM" },
    "04/09/2025": { checkin: "10:19 AM", checkout: "6:00 PM" }, 
    "05/09/2025": { checkin: "10:11 AM", checkout: "9:39 PM" },
    "06/09/2025": { checkin: "10:00 AM", checkout: "6:00 PM" }, 
    "07/09/2025": { checkin: "10:12 AM", checkout: "7:39 PM" },
    "08/09/2025": { checkin: "10:22 AM", checkout: "5:49 PM" },
    "09/09/2025": { checkin: "10:37 AM", checkout: "6:54 PM" },
    "10/09/2025": { checkin: "10:39 AM", checkout: "3:39 PM" },
    "11/09/2025": "Absent",
    "12/09/2025": "Absent",
    "14/09/2025": "Sunday",
  },
  Aman: {
    "01/09/2025": { checkin: "10:00 AM", checkout: "6:00 PM" }, 
    "02/09/2025": { checkin: "10:00 AM", checkout: "6:00 PM" }, 
    "03/09/2025": { checkin: "10:19 AM", checkout: "9:29 PM" },
    "04/09/2025": { checkin: "10:10 AM", checkout: "9:27 PM" },
    "05/09/2025": { checkin: "10:59 AM", checkout: "6:00 PM" }, 
    "06/09/2025": "Absent",
    "07/09/2025": { checkin: "10:39 AM", checkout: "9:05 PM" },
    "08/09/2025": { checkin: "10:46 AM", checkout: "9:46 PM" },
    "09/09/2025": { checkin: "10:41 AM", checkout: "10:10 AM" },
    "10/09/2025": { checkin: "10:38 AM", checkout: "9:37 PM" },
    "11/09/2025": { checkin: "10:02 AM", checkout: "3:45 PM" },
    "12/09/2025": { checkin: "10:05 AM", checkout: "6:00 PM" }, 
    "14/09/2025": "Sunday",
  },
};

function parseTimeTo24Hour(timeStr: string): string {
    if (!timeStr || !timeStr.includes(' ')) return '--:--';
    try {
        const date = parse(timeStr, 'h:mm a', new Date());
        return format(date, 'HH:mm');
    } catch (e) {
        return '--:--';
    }
}


function processAttendanceData(data: any, employee: any, store: Map<string, AttendanceRecord[]>) {
    const employeeData = data[employee.name];
    if (employeeData) {
      const records = store.get(employee.id) || [];
      const existingDates = new Set(records.map(r => r.date));

      Object.keys(employeeData).forEach((dateStr) => {
        const recordDate = parse(dateStr, 'dd/MM/yyyy', new Date());
        const formattedDate = format(recordDate, 'yyyy-MM-dd');
        
        if (existingDates.has(formattedDate)) return;

        if (holidays.some(h => h.date === formattedDate)) return;
        
        if (recordDate.getDay() === 0) return;

        const attendanceInfo = employeeData[dateStr];
        const elevenAm = parse('11:00', 'HH:mm', recordDate);

        let checkInTime = '--:--';
        let checkOutTime = '--:--';
        let status: AttendanceStatus = 'Absent';

        if (typeof attendanceInfo === 'string') {
           if (attendanceInfo.toLowerCase().includes('puja') || attendanceInfo.toLowerCase() === 'absent') {
            status = 'Absent';
          } else if (attendanceInfo === 'Present') {
            status = 'Present';
            checkInTime = '11:00'; 
            checkOutTime = '19:00';
          }
        } else {
          const validCheckin = attendanceInfo.checkin && !['Present', 'Absent', 'HRS'].includes(attendanceInfo.checkin);
          const validCheckout = attendanceInfo.checkout && !['Present', 'Absent', 'HRS'].includes(attendanceInfo.checkout);
          
          if(validCheckin) {
             checkInTime = parseTimeTo24Hour(attendanceInfo.checkin);
             const checkInDate = parse(checkInTime, "HH:mm", recordDate);
             status = isBefore(checkInDate, elevenAm) || checkInDate.getTime() === elevenAm.getTime() ? 'Present' : 'Late';
          }

          if (validCheckout) {
             checkOutTime = parseTimeTo24Hour(attendanceInfo.checkout);
          }
          
          if (attendanceInfo.checkin === 'Present') {
              status = 'Present';
              checkInTime = '11:00'; 
              if(validCheckout) {
                  checkOutTime = parseTimeTo24Hour(attendanceInfo.checkout);
              } else {
                 checkOutTime = '19:00';
              }
          } else if (!validCheckin) {
            status = 'Absent';
          }
        }
        
        records.push({
          employeeId: employee.id,
          employeeName: employee.name,
          date: formattedDate,
          status,
          checkInTime,
          checkOutTime,
        });

      });
       store.set(employee.id, records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    }
}

let dataSeeded = false;

function seedInitialData() {
  if (dataSeeded) return;
  
  allTimeAttendanceStore.clear(); 

  mockEmployees.forEach((employee) => {
    if (!allTimeAttendanceStore.has(employee.id)) {
        allTimeAttendanceStore.set(employee.id, []);
    }
    processAttendanceData(septemberData, employee, allTimeAttendanceStore);
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  allTimeAttendanceStore.forEach((records, employeeId) => {
    const todayRecord = records.find(r => r.date === todayStr);
    if (todayRecord) {
        attendanceStore.set(employeeId, todayRecord);
    }
  });
  dataSeeded = true;
}

seedInitialData();
