

import { AttendanceRecord, AttendanceStatus } from "@/lib/types";
import { employees as mockEmployees } from "@/lib/data";
import { format, parse, differenceInHours, differenceInMinutes, isBefore } from "date-fns";
import { holidays } from "./holidays";

// Store for today's attendance, initialized from historical data if the day matches.
export const attendanceStore = new Map<string, AttendanceRecord>();

// Store for historical attendance data
export const allTimeAttendanceStore = new Map<string, AttendanceRecord[]>();

const augustData = {
    Sathish: {
        '01/08/2025': { checkin: '12.09 PM', checkout: '7.28 PM' },
        '02/08/2025': { checkin: '11.11 AM', checkout: '5.59 PM' },
        '04/08/2025': { checkin: '12.08 PM', checkout: '7.17 PM' },
        '05/08/2025': { checkin: '12.00 PM', checkout: '6.02 PM' },
        '06/08/2025': { checkin: '12.31 PM', checkout: '7.15 PM' },
        '07/08/2025': { checkin: '12.14 PM', checkout: '8.01 PM' },
        '08/08/2025': { checkin: '12.22 PM', checkout: '6.57 PM' },
        '09/08/2025': { checkin: '1.54 PM', checkout: '7.13 PM' },
        '11/08/2025': { checkin: '12.10 PM', checkout: '6.37 PM' },
        '12/08/2025': { checkin: '11.35 AM', checkout: '7.32 PM' },
        '13/08/2025': { checkin: '12.34 PM', checkout: '7.41 PM' },
        '14/08/2025': { checkin: '12.19 PM', checkout: '9.01 PM' },
        '15/08/2025': 'Absent',
        '16/08/2025': { checkin: '11.40 AM', checkout: '7.29 PM' },
        '18/08/2025': { checkin: '12.18 PM', checkout: '9.08 PM' },
        '19/08/2025': { checkin: '11.53 AM', checkout: '6.40 PM' },
        '20/08/2025': { checkin: '11.53 AM', checkout: '7.08 PM' },
        '21/08/2025': { checkin: '12.16 PM', checkout: '8.26 PM' },
        '22/08/2025': { checkin: '12.52 PM', checkout: '7.08 PM' },
        '23/08/2025': 'Absent',
        '25/08/2025': { checkin: '11.35 AM', checkout: '8.39 PM' },
        '26/08/2025': { checkin: '10.45 AM', checkout: '7.21 PM' },
        '27/08/2025': 'Ganesh Puja',
        '28/08/2025': { checkin: '11.55 AM', checkout: '7.10 PM' },
        '29/08/2025': { checkin: '12.03 PM', checkout: '8.43 PM' },
        '30/08/2025': { checkin: '12.23 PM', checkout: '7.03 PM' },
    },
    Madhu: {
        '01/08/2025': { checkin: '1.10 PM', checkout: '6.39 PM' },
        '02/08/2025': { checkin: '11.11 AM', checkout: '7.20 PM' },
        '03/08/2025': { checkin: '12.54 PM', checkout: '6.28 PM' },
        '04/08/2025': { checkin: '11.45 AM', checkout: '6.57 PM' },
        '05/08/2025': { checkin: '11.15 AM', checkout: '7.01 PM' },
        '06/08/2025': 'Absent',
        '07/08/2025': 'Absent',
        '08/08/2025': 'Absent',
        '09/08/2025': { checkin: 'Present', checkout: '7.33 PM' },
        '10/08/2025': 'Absent', '11/08/2025': 'Absent', '12/08/2025': 'Absent', '13/08/2025': 'Absent',
        '14/08/2025': 'Absent', '15/08/2025': 'Absent', '16/08/2025': 'Absent', '17/08/2025': 'Absent',
        '18/08/2025': 'Absent', '19/08/2025': 'Absent', '20/08/2025': 'Absent', '21/08/2025': 'Absent',
        '22/08/2025': 'Absent', '23/08/2025': 'Absent', '24/08/2025': 'Absent', '25/08/2025': 'Absent',
    },
    Raghavendra: {
        '01/08/2025': { checkin: '10.44 AM', checkout: '6.52 PM' },
        '02/08/2025': { checkin: '10.27 AM', checkout: '4.47 PM' },
        '03/08/2025': { checkin: '11.14 AM', checkout: '2.10 PM' },
        '04/08/2025': { checkin: '11.19 AM', checkout: '7.03 PM' },
        '05/08/2025': { checkin: '10.33 AM', checkout: '7.01 PM' },
        '06/08/2025': { checkin: '10.46 AM', checkout: '7.20 PM' },
        '07/08/2025': { checkin: '11.45 AM', checkout: '7.23 PM' },
        '08/08/2025': { checkin: 'Present', checkout: '7.33 PM' },
        '09/08/2025': { checkin: '11.07 AM', checkout: '8.38 PM' },
        '10/08/2025': { checkin: '10.41 AM', checkout: '7.35 PM' },
        '11/08/2025': { checkin: '11.00 AM', checkout: '6.36 PM' },
        '12/08/2025': { checkin: '10.41 AM', checkout: '7.27 PM' },
        '13/08/2025': { checkin: '1.46 PM', checkout: '7.29 PM' },
        '14/08/2025': { checkin: '1.26 PM', checkout: '7.59 PM' },
        '15/08/2025': { checkin: '10.54 AM', checkout: '7.46 PM' },
        '16/08/2025': { checkin: '10.47 AM', checkout: '8.12 PM' },
        '17/08/2025': { checkin: '10.55 AM', checkout: '8.10 PM' },
        '18/08/2025': { checkin: '10.54 AM', checkout: '8.07 PM' },
        '19/08/2025': { checkin: '11.34 AM', checkout: '6.37 PM' },
        '20/08/2025': { checkin: '10.53 AM', checkout: 'Absent' },
        '21/08/2025': 'Absent',
        '22/08/2025': { checkin: '10.28 AM', checkout: '8.10 PM' },
        '23/08/2025': { checkin: '10.58 AM', checkout: '7.48 PM' },
        '24/08/2025': { checkin: '10.49 AM', checkout: '7.26 PM' },
        '25/08/2025': { checkin: '10.56 AM', checkout: '4.47 PM' },
    },
    Safee: {
        '01/08/2025': { checkin: '1.10 PM', checkout: '6.39 PM' },
        '02/08/2025': { checkin: 'Present', checkout: '6.31 PM' },
        '03/08/2025': { checkin: '12.54 PM', checkout: '6.28 PM' },
        '04/08/2025': { checkin: '11.45 AM', checkout: '6.57 PM' },
        '05/08/2025': { checkin: '10.30 AM', checkout: '6.27 PM' },
        '06/08/2025': 'Absent',
        '07/08/2025': { checkin: '1.14 PM', checkout: '5.40 PM' },
        '08/08/2025': { checkin: '10.22 AM', checkout: '6.32 PM' },
        '09/08/2025': { checkin: '12.29 PM', checkout: '5.54 PM' },
        '10/08/2025': { checkin: '10.23 AM', checkout: '7.45 PM' },
        '11/08/2025': { checkin: '10.31 AM', checkout: '6.05 PM' },
        '12/08/2025': { checkin: '10.35 AM', checkout: '6.43 PM' },
        '13/08/2025': { checkin: '10.44 AM', checkout: '5.02 PM' },
        '14/08/2025': 'Absent',
        '15/08/2025': { checkin: '11.49 AM', checkout: '5.25 PM' },
        '16/08/2025': { checkin: '10.18 AM', checkout: '6.51 PM' },
        '17/08/2025': { checkin: '10.19 AM', checkout: '6.37 PM' },
        '18/08/2025': { checkin: '10.29 AM', checkout: '5.37 PM' },
        '19/08/2025': { checkin: '10.37 AM', checkout: '6.04 PM' },
        '20/08/2025': { checkin: '11.32 AM', checkout: '5.08 PM' },
        '21/08/2025': { checkin: '10.01 AM', checkout: '6.36 PM' },
        '22/08/2025': { checkin: '10.17 AM', checkout: '6.57 PM' },
        '23/08/2025': { checkin: '10.25 AM', checkout: '6.30 PM' },
        '24/08/2025': { checkin: '10.31 AM', checkout: '5.26 PM' },
        '25/08/2025': { checkin: '10.30 AM', checkout: '6.45 PM' },
    },
    Dhiren: {
        '01/08/2025': 'Present', '02/08/2025': 'Present', '03/08/2025': 'Present',
        '04/08/2025': 'Present', '05/08/2025': 'Present', '06/08/2025': 'Present',
        '07/08/2025': 'Present', '08/08/2025': 'Present', '09/08/2025': 'Present',
        '10/08/2025': 'Present',
        '11/08/2025': { checkin: '11.00 AM', checkout: '6.56 PM' },
        '12/08/2025': { checkin: '10.43 AM', checkout: '7.21 PM' },
        '13/08/2025': { checkin: '10.14 AM', checkout: '5.00 PM' },
        '14/08/2025': { checkin: '10.21 AM', checkout: '6.33 PM' },
        '15/08/2025': { checkin: '11.15 AM', checkout: '7.00 PM' },
        '16/08/2025': { checkin: '11.17 AM', checkout: '7.15 PM' },
        '17/08/2025': { checkin: '10.49 AM', checkout: '6.57 PM' },
        '18/08/2025': { checkin: '10.50 AM', checkout: '6.58 PM' },
        '19/08/2025': { checkin: '10.41 AM', checkout: '6.53 PM' },
        '20/08/2025': { checkin: '10.40 AM', checkout: '6.44 PM' },
        '21/08/2025': { checkin: '10.43 AM', checkout: '6.52 PM' },
        '22/08/2025': { checkin: '10.32 AM', checkout: '6.42 PM' },
        '23/08/2025': { checkin: '10.36 AM', checkout: '6.40 PM' },
        '24/08/2025': { checkin: '10.53 AM', checkout: '6.46 PM' },
        '25/08/2025': { checkin: '10.28 AM', checkout: '6.43 PM' },
    },
    Arjun: {
        '01/08/2025': 'Present', '02/08/2025': 'Present', '03/08/2025': 'Absent',
        '04/08/2025': 'Present', '05/08/2025': 'Present', '06/08/2025': 'Present',
        '07/08/2025': 'Present', '08/08/2025': 'Present', '09/08/2025': 'Present',
        '10/08/2025': 'Present',
        '11/08/2025': { checkin: '10.11 AM', checkout: '9.22 PM' },
        '12/08/2025': { checkin: '10.03 AM', checkout: '9.19 PM' },
        '13/08/2025': { checkin: '9.49 AM', checkout: 'Present' },
        '14/08/2025': { checkin: '9.46 AM', checkout: 'Present' },
        '15/08/2025': { checkin: '10.28 AM', checkout: 'Present' },
        '16/08/2025': { checkin: '10.14 AM', checkout: '10.06 PM' },
        '17/08/2025': { checkin: '10.17 AM', checkout: '9.29 PM' },
        '18/08/2025': { checkin: '1.10 PM', checkout: '7.49 PM' },
        '19/08/2025': { checkin: '10.23 AM', checkout: '8.34 PM' },
        '20/08/2025': { checkin: '10.41 AM', checkout: '5.06 PM' },
        '21/08/2025': { checkin: '9.57 AM', checkout: '11.06 PM' },
        '22/08/2025': { checkin: '9.58 AM', checkout: '10.21 PM' },
        '23/08/2025': { checkin: '10.03 AM', checkout: '8.19 PM' },
        '24/08/2025': { checkin: '10.04 AM', checkout: '7.00 PM' },
    },
    Aman: {
        '01/08/2025': 'Present', '02/08/2025': 'Present', '03/08/2025': 'Present',
        '04/08/2025': 'Present', '05/08/2025': 'Present', '06/08/2025': 'Present',
        '07/08/2025': 'Present', '08/08/2025': 'Present', '09/08/2025': 'Present',
        '10/08/2025': 'Present',
        '11/08/2025': { checkin: '10.21 AM', checkout: '6.55 PM' },
        '12/08/2025': { checkin: '10.03 AM', checkout: '8.13 PM' },
        '13/08/2025': { checkin: '10.05 AM', checkout: '7.49 PM' },
        '14/08/2025': { checkin: '9.55 AM', checkout: '9.21 PM' },
        '15/08/2025': { checkin: '10.19 AM', checkout: '8.48 PM' },
        '16/08/2025': { checkin: '10.04 AM', checkout: '8.14 PM' },
        '17/08/2025': { checkin: '10.18 AM', checkout: '9.39 PM' },
        '18/08/2025': { checkin: '10.16 AM', checkout: 'Present' },
        '19/08/2025': { checkin: '10.15 AM', checkout: '7.54 PM' },
        '20/08/2025': { checkin: '10.11 AM', checkout: 'Present' },
        '21/08/2025': { checkin: '9.42 AM', checkout: 'Present' },
        '22/08/2025': { checkin: '9.57 AM', checkout: 'Present' },
        '23/08/2025': { checkin: '10.14 AM', checkout: 'Present' },
        '24/08/2025': { checkin: '10.14 AM', checkout: 'Absent' },
    }
};

const septemberData = {
  Sathish: {
    "01/09/2025": { checkin: "12.08 PM", checkout: "8.15 PM" },
    "02/09/2025": { checkin: "12.01 PM", checkout: "7.39 PM" },
    "03/09/2025": { checkin: "12.48 PM", checkout: "6.17 PM" },
    "04/09/2025": { checkin: "12.16 PM", checkout: "8.48 PM" },
    "05/09/2025": { checkin: "12.49 PM", checkout: "7.39 PM" },
    "06/09/2025": { checkin: "12.26 PM", checkout: "8.26 PM" },
    "08/09/2025": { checkin: "12.07 PM", checkout: "8.56 PM" },
    "09/09/2025": { checkin: "11.52 AM", checkout: "8.42 PM" },
    "10/09/2025": { checkin: "1.06 PM", checkout: "9.29 PM" },
    "11/09/2025": { checkin: "11.24 AM", checkout: "8.48 PM" },
    "12/09/2025": "Absent",
    "13/09/2025": { checkin: "12.31 PM", checkout: "Absent" },
  },
  Raghavendra: {
    "01/09/2025": { checkin: "10.47 AM", checkout: "8.07 PM" },
    "02/09/2025": { checkin: "10.58 AM", checkout: "8.39 PM" },
    "03/09/2025": { checkin: "11.09 AM", checkout: "5.44 PM" },
    "04/09/2025": { checkin: "10.47 AM", checkout: "7.26 PM" },
    "05/09/2025": { checkin: "10.54 AM", checkout: "7.56 PM" },
    "06/09/2025": { checkin: "10.57 AM", checkout: "9.10 PM" },
    "07/09/2025": { checkin: "11.27 AM", checkout: "9.23 PM" },
    "08/09/2025": { checkin: "10.53 AM", checkout: "8.25 PM" },
    "09/09/2025": "Absent",
    "10/09/2025": { checkin: "10.53 AM", checkout: "8.45 PM" },
    "11/09/2025": { checkin: "10.47 AM", checkout: "8.40 PM" },
    "12/09/2025": { checkin: "10.40 AM", checkout: "HRS" },
  },
  Safee: {
    "01/09/2025": { checkin: "10.54 AM", checkout: "7.16 PM" },
    "02/09/2025": { checkin: "10.18 AM", checkout: "6.56 PM" },
    "03/09/2025": { checkin: "10.41 AM", checkout: "6.13 PM" },
    "04/09/2025": { checkin: "11.00 AM", checkout: "6.22 PM" },
    "05/09/2025": { checkin: "10.46 AM", checkout: "6.15 PM" },
    "06/09/2025": { checkin: "10.25 AM", checkout: "7.11 PM" },
    "07/09/2025": { checkin: "10.01 AM", checkout: "7.17 PM" },
    "08/09/2025": "Absent",
    "09/09/2025": "Absent",
    "10/09/2025": "Absent",
    "11/09/2025": "Absent",
    "12/09/2025": "Absent",
  },
  Dhiren: {
    "01/09/2025": { checkin: "10.52 AM", checkout: "7.04 PM" },
    "02/09/2025": { checkin: "10.54 AM", checkout: "6.52 PM" },
    "03/09/2025": { checkin: "10.57 AM", checkout: "6.53 PM" },
    "04/09/2025": { checkin: "11.09 AM", checkout: "6.51 PM" },
    "05/09/2025": { checkin: "10.45 AM", checkout: "6.55 PM" },
    "06/09/2025": { checkin: "10.45 AM", checkout: "3.48 PM" },
    "07/09/2025": { checkin: "10.48 AM", checkout: "6.57 PM" },
    "08/09/2025": { checkin: "10.33 AM", checkout: "6.43 PM" },
    "09/09/2025": { checkin: "11.11 AM", checkout: "6.54 PM" },
    "10/09/2025": { checkin: "11.06 AM", checkout: "6.55 PM" },
    "11/09/2025": { checkin: "11.01 AM", checkout: "6.50 PM" },
    "12/09/2025": { checkin: "10.33 AM", checkout: "HRS" },
  },
  Arjun: {
    "01/09/2025": { checkin: "10.11 AM", checkout: "8.06 PM" },
    "02/09/2025": { checkin: "Present", checkout: "9.12 PM" },
    "03/09/2025": { checkin: "10.18 AM", checkout: "8.29 PM" },
    "04/09/2025": { checkin: "10.19 AM", checkout: "Present" },
    "05/09/2025": { checkin: "10.11 AM", checkout: "9.39 PM" },
    "06/09/2025": { checkin: "Present", checkout: "6.55 PM" },
    "07/09/2025": { checkin: "10.12 AM", checkout: "7.39 PM" },
    "08/09/2025": { checkin: "10.22 AM", checkout: "5.49 PM" },
    "09/09/2025": { checkin: "10.37 AM", checkout: "6.54 PM" },
    "10/09/2025": { checkin: "10.39 AM", checkout: "3.39 PM" },
    "11/09/2025": "Absent",
    "12/09/2025": "Absent",
  },
  Aman: {
    "01/09/2025": "Present",
    "02/09/2025": "Present",
    "03/09/2025": { checkin: "10.19 AM", checkout: "9.29 PM" },
    "04/09/2025": { checkin: "10.10 AM", checkout: "9.27 PM" },
    "05/09/2025": { checkin: "10.59 AM", checkout: "Present" },
    "06/09/2025": "Absent",
    "07/09/2025": { checkin: "10.39 AM", checkout: "9.05 PM" },
    "08/09/2025": { checkin: "10.46 AM", checkout: "9.46 PM" },
    "09/09/2025": { checkin: "10.41 AM", checkout: "10.10 AM" },
    "10/09/2025": { checkin: "10.38 AM", checkout: "9.37 PM" },
    "11/09/2025": { checkin: "10.02 AM", checkout: "3.45 PM" },
    "12/09/2025": { checkin: "10.05 AM" },
  },
};

function parseTimeTo24Hour(timeStr: string): string {
    if (!timeStr || !timeStr.includes(' ')) return '--:--';
    try {
        const date = parse(timeStr, 'h.mm a', new Date());
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
    processAttendanceData(augustData, employee, allTimeAttendanceStore);
  });

  const todayStr = format(new Date("2025-09-30"), "yyyy-MM-dd");
  allTimeAttendanceStore.forEach((records, employeeId) => {
    const todayRecord = records.find(r => r.date === todayStr);
    if (todayRecord) {
        attendanceStore.set(employeeId, todayRecord);
    }
  });
  dataSeeded = true;
}

seedInitialData();
    
