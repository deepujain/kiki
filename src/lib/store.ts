import { AttendanceRecord, AttendanceStatus, Employee } from "./types.js";
import { employees as mockEmployees } from "./data.js";
import { format, parse, isBefore } from "date-fns";
import { holidays } from "./holidays.js";
import { db } from "./database/database.js"; // Import LowDB instance

// Store for today's attendance, initialized from historical data if the day matches.
// export const attendanceStore = new Map<string, AttendanceRecord>();


const julyData = {
  Sathish: {
    "01/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "02/07/2025": { checkin: "12:18 PM", checkout: "6:49 PM" },
    "03/07/2025": { checkin: "2:46 PM", checkout: "7:26 PM" },
    "04/07/2025": { checkin: "12:03 PM", checkout: "7:29 PM" },
    "05/07/2025": { checkin: "12:17 PM", checkout: "7:53 PM" },
    "06/07/2025": "Sunday",
    "07/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "08/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "09/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "10/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "11/07/2025": { checkin: "12:27 PM", checkout: "8:12 PM" },
    "12/07/2025": { checkin: "12:02 PM", checkout: "7:10 PM" },
    "13/07/2025": "Sunday",
    "14/07/2025": { checkin: "11:32 AM", checkout: "7:37 PM" },
    "15/07/2025": { checkin: "12:27 PM", checkout: "8:13 PM" },
    "16/07/2025": { checkin: "10:59 AM", checkout: "5:39 PM" },
    "17/07/2025": { checkin: "1:04 PM", checkout: "5:03 PM" },
    "18/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "19/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "20/07/2025": "Sunday",
    "21/07/2025": { checkin: "12:17 PM", checkout: "7:14 PM" },
    "22/07/2025": { checkin: "12:24 PM", checkout: "6:59 PM" },
    "23/07/2025": { checkin: "12:39 PM", checkout: "6:01 PM" },
    "24/07/2025": { checkin: "1:23 PM", checkout: "4:19 PM" },
    "25/07/2025": { checkin: "2:15 PM", checkout: "7:53 PM" },
    "26/07/2025": { checkin: "1:23 PM", checkout: "6:24 PM" },
    "27/07/2025": "Sunday",
    "28/07/2025": { checkin: "1:59 PM", checkout: "8:27 PM" },
    "29/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "30/07/2025": { checkin: "11:59 AM", checkout: "6:44 PM" },
    "31/07/2025": { checkin: "12:25 PM", checkout: "7:15 PM" }
  },


  Raghavendra: {
    "01/07/2025": "Absent",
    "02/07/2025": "Absent",
    "03/07/2025": "Absent",
    "04/07/2025": "Absent",
    "05/07/2025": "Absent",
    "06/07/2025": "Absent",
    "07/07/2025": "Absent",
    "08/07/2025": "Absent",
    "09/07/2025": "Absent",
    "10/07/2025": "Absent",
    "11/07/2025": "Absent",
    "12/07/2025": "Absent",
    "13/07/2025": "Sunday",
    "14/07/2025": "Absent",
    "15/07/2025": "Absent",
    "16/07/2025": "Absent",
    "17/07/2025": "Absent",
    "18/07/2025": "Absent",
    "19/07/2025": "Absent",
    "20/07/2025": "Absent",
    "21/07/2025": "Absent",
    "22/07/2025": "Absent",
    "23/07/2025": "Absent",
    "24/07/2025": "Absent",
    "25/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "26/07/2025": { checkin: "2:14 PM", checkout: "7:07 PM" },
    "27/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "28/07/2025": { checkin: "10:39 AM", checkout: "6:43 PM" },
    "29/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "30/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "31/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" }
  },

  Safee: {
    "01/07/2025": "Absent",
    "02/07/2025": "Absent",
    "03/07/2025": "Absent",
    "04/07/2025": "Absent",
    "05/07/2025": "Absent",
    "06/07/2025": "Absent",
    "07/07/2025": "Absent",
    "08/07/2025": "Absent",
    "09/07/2025": "Absent",
    "10/07/2025": "Absent",
    "11/07/2025": "Absent",
    "12/07/2025": "Absent",
    "13/07/2025": "Sunday",
    "14/07/2025": "Absent",
    "15/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "16/07/2025": "Absent",
    "17/07/2025": "Absent",
    "18/07/2025": "Absent",
    "19/07/2025": "Absent",
    "20/07/2025": "Absent",
    "21/07/2025": "Absent",
    "22/07/2025": "Absent",
    "23/07/2025": "Absent",
    "24/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "25/07/2025": "Absent",
    "26/07/2025": "Absent",
    "27/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "28/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "29/07/2025": "Absent",
    "30/07/2025": "Absent",
    "31/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" }
  },

  Dhiren: {
    "01/07/2025": { checkin: "10:20 AM", checkout: "7:21 PM" },
    "02/07/2025": { checkin: "10:24 AM", checkout: "8:10 PM" },
    "03/07/2025": { checkin: "10:38 AM", checkout: "7:26 PM" },
    "04/07/2025": { checkin: "12:51 PM", checkout: "8:22 PM" },
    "05/07/2025": { checkin: "10:23 AM", checkout: "7:53 PM" },
    "06/07/2025": "Absent",
    "07/07/2025": { checkin: "10:31 AM", checkout: "7:20 PM" },
    "08/07/2025": { checkin: "10:33 AM", checkout: "7:45 PM" },
    "09/07/2025": { checkin: "10:23 AM", checkout: "6:56 PM" },
    "10/07/2025": { checkin: "10:26 AM", checkout: "7:18 PM" },
    "11/07/2025": { checkin: "10:38 AM", checkout: "7:45 PM" },
    "12/07/2025": "Absent",
    "13/07/2025": "Sunday",
    "14/07/2025": "Absent",
    "15/07/2025": "Absent",
    "16/07/2025": "Absent",
    "17/07/2025": "Absent",
    "18/07/2025": "Absent",
    "19/07/2025": "Absent",
    "20/07/2025": "Absent",
    "21/07/2025": "Absent",
    "22/07/2025": "Absent",
    "23/07/2025": "Absent",
    "24/07/2025": "Absent",
    "25/07/2025": "Absent",
    "26/07/2025": "Absent",
    "27/07/2025": "Absent",
    "28/07/2025": "Absent",
    "29/07/2025": "Absent",
    "30/07/2025": "Absent",
    "31/07/2025": "Absent"
  },

  Arjun: {
    "01/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "02/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "03/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "04/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "05/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "06/07/2025": "Absent",
    "07/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "08/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "09/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "10/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "11/07/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "12/07/2025": "Absent",
    "13/07/2025": "Sunday",
    "14/07/2025": "Absent",
    "15/07/2025": "Absent",
    "16/07/2025": "Absent",
    "17/07/2025": "Absent",
    "18/07/2025": "Absent",
    "19/07/2025": "Absent",
    "20/07/2025": "Absent",
    "21/07/2025": "Absent",
    "22/07/2025": "Absent",
    "23/07/2025": "Absent",
    "24/07/2025": "Absent",
    "25/07/2025": "Absent",
    "26/07/2025": "Absent",
    "27/07/2025": "Absent",
    "28/07/2025": "Absent",
    "29/07/2025": "Absent",
    "30/07/2025": "Absent",
    "31/07/2025": "Absent"
  }
};


const augustData = {
  Sathish: {
    "01/08/2025": { checkin: "12:09 PM", checkout: "7:28 PM" },
    "02/08/2025": { checkin: "11:11 AM", checkout: "5:59 PM" },
    "03/08/2025": "Sunday",
    "04/08/2025": { checkin: "12:08 PM", checkout: "7:17 PM" },
    "05/08/2025": { checkin: "12:00 PM", checkout: "6:02 PM" },
    "06/08/2025": { checkin: "12:31 PM", checkout: "7:15 PM" },
    "07/08/2025": { checkin: "12:14 PM", checkout: "8:10 PM" },
    "08/08/2025": { checkin: "12:22 PM", checkout: "6:57 PM" },
    "09/08/2025": { checkin: "1:54 PM", checkout: "7:13 PM" },
    "10/08/2025": "Sunday",
    "11/08/2025": { checkin: "12:01 PM", checkout: "6:37 PM" },
    "12/08/2025": { checkin: "11:35 AM", checkout: "7:32 PM" },
    "13/08/2025": { checkin: "12:34 PM", checkout: "7:41 PM" },
    "14/08/2025": { checkin: "12:19 PM", checkout: "9:01 PM" },
    "15/08/2025": "Absent",
    "16/08/2025": { checkin: "11:40 AM", checkout: "7:29 PM" },
    "17/08/2025": "Sunday",
    "18/08/2025": { checkin: "12:18 PM", checkout: "9:08 PM" },
    "19/08/2025": { checkin: "11:53 AM", checkout: "6:40 PM" },
    "20/08/2025": { checkin: "11:53 AM", checkout: "7:08 PM" },
    "21/08/2025": { checkin: "12:16 PM", checkout: "8:26 PM" },
    "22/08/2025": { checkin: "12:52 PM", checkout: "7:08 PM" },
    "23/08/2025": "Absent",
    "24/08/2025": "Sunday",
    "25/08/2025": { checkin: "11:35 AM", checkout: "8:39 PM" },
    "26/08/2025": { checkin: "10:45 AM", checkout: "7:21 PM" },
    "27/08/2025": "Ganesh Puja",
    "28/08/2025": { checkin: "11:55 AM", checkout: "7:10 PM" },
    "29/08/2025": { checkin: "12:03 PM", checkout: "8:43 PM" },
    "30/08/2025": { checkin: "12:23 PM", checkout: "7:03 PM" },
    "31/08/2025": "Sunday"
  },
  Raghavendra: {
    "01/08/2025": { checkin: "10:44 AM", checkout: "6:52 PM" },
    "02/08/2025": { checkin: "10:27 AM", checkout: "4:47 PM" },
    "03/08/2025": "Sunday",
    "04/08/2025": { checkin: "11:14 AM", checkout: "2:10 PM" },
    "05/08/2025": { checkin: "11:19 AM", checkout: "7:03 PM" },
    "06/08/2025": { checkin: "10:33 AM", checkout: "7:01 PM" },
    "07/08/2025": { checkin: "10:46 AM", checkout: "7:20 PM" },
    "08/08/2025": { checkin: "11:45 AM", checkout: "7:23 PM" },
    "09/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "10/08/2025": { checkin: "11:07 AM", checkout: "7:33 PM" },
    "11/08/2025": { checkin: "10:41 AM", checkout: "8:38 PM" },
    "12/08/2025": { checkin: "11:00 AM", checkout: "7:35 PM" },
    "13/08/2025": { checkin: "10:41 AM", checkout: "6:36 PM" },
    "14/08/2025": { checkin: "1:46 PM", checkout: "7:27 PM" },
    "15/08/2025": { checkin: "1:26 PM", checkout: "7:29 PM" },
    "16/08/2025": "Sunday",
    "17/08/2025": { checkin: "10:54 AM", checkout: "7:59 PM" },
    "18/08/2025": { checkin: "10:47 AM", checkout: "7:46 PM" },
    "19/08/2025": { checkin: "10:55 AM", checkout: "8:12 PM" },
    "20/08/2025": { checkin: "10:54 AM", checkout: "8:10 PM" },
    "21/08/2025": { checkin: "11:34 AM", checkout: "8:07 PM" },
    "22/08/2025": { checkin: "10:53 AM", checkout: "6:37 PM" },
    "23/08/2025": "Absent",
    "24/08/2025": { checkin: "10:28 AM", checkout: "8:10 PM" },
    "25/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "26/08/2025": { checkin: "10:58 AM", checkout: "7:48 PM" },
    "27/08/2025": { checkin: "10:49 AM", checkout: "7:26 PM" },
    "28/08/2025": { checkin: "10:56 AM", checkout: "7:21 PM" },
    "29/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "30/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "31/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" }
  },
  Safee: {
    "01/08/2025": { checkin: "1:10 PM", checkout: "5:30 PM" },
    "02/08/2025": { checkin: "10:00 AM", checkout: "6:30 PM" },
    "03/08/2025": "Sunday",
    "04/08/2025": { checkin: "12:54 PM", checkout: "5:30 PM" },
    "05/08/2025": { checkin: "11:45 AM", checkout: "7:00 PM" },
    "06/08/2025": { checkin: "10:30 AM", checkout: "6:27 PM" },
    "07/08/2025": "Absent",
    "08/08/2025": { checkin: "1:14 PM", checkout: "5:40 PM" },
    "09/08/2025": { checkin: "10:22 AM", checkout: "6:32 PM" },
    "10/08/2025": "Absent",
    "11/08/2025": { checkin: "12:29 PM", checkout: "5:54 PM" },
    "12/08/2025": { checkin: "10:23 AM", checkout: "7:45 PM" },
    "13/08/2025": { checkin: "10:31 AM", checkout: "6:05 PM" },
    "14/08/2025": { checkin: "10:35 AM", checkout: "6:43 PM" },
    "15/08/2025": { checkin: "10:44 AM", checkout: "5:02 PM" },
    "16/08/2025": "Absent",
    "17/08/2025": "Sunday",
    "18/08/2025": { checkin: "11:49 AM", checkout: "5:25 PM" },
    "19/08/2025": { checkin: "10:18 AM", checkout: "6:51 PM" },
    "20/08/2025": { checkin: "10:19 AM", checkout: "6:37 PM" },
    "21/08/2025": { checkin: "10:29 AM", checkout: "5:37 PM" },
    "22/08/2025": { checkin: "10:37 AM", checkout: "6:04 PM" },
    "23/08/2025": { checkin: "11:32 AM", checkout: "5:08 PM" },
    "24/08/2025": "Absent",
    "25/08/2025": { checkin: "10:01 AM", checkout: "6:36 PM" },
    "26/08/2025": { checkin: "10:17 AM", checkout: "6:57 PM" },
    "27/08/2025": "Absent",
    "28/08/2025": { checkin: "10:25 AM", checkout: "6:30 PM" },
    "29/08/2025": "Absent",
    "30/08/2025": { checkin: "10:31 AM", checkout: "5:26 PM" },
    "31/08/2025": { checkin: "10:30 AM", checkout: "6:45 PM" }
  },
  Dhiren: {
    "01/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "02/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "03/08/2025": "Sunday",
    "04/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "05/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "06/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "07/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "08/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "09/08/2025": "Absent",
    "10/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "11/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "12/08/2025": { checkin: "11:00 AM", checkout: "6:56 PM" },
    "13/08/2025": { checkin: "10:43 AM", checkout: "7:21 PM" },
    "14/08/2025": { checkin: "10:14 AM", checkout: "5:00 PM" },
    "15/08/2025": { checkin: "10:21 AM", checkout: "6:33 PM" },
    "16/08/2025": "Sunday",
    "17/08/2025": "Absent",
    "18/08/2025": { checkin: "11:15 AM", checkout: "7:00 PM" },
    "19/08/2025": { checkin: "11:17 AM", checkout: "7:15 PM" },
    "20/08/2025": { checkin: "10:49 AM", checkout: "6:57 PM" },
    "21/08/2025": { checkin: "10:50 AM", checkout: "6:58 PM" },
    "22/08/2025": { checkin: "10:41 AM", checkout: "6:53 PM" },
    "23/08/2025": { checkin: "10:40 AM", checkout: "6:44 PM" },
    "24/08/2025": "Absent",
    "25/08/2025": { checkin: "10:43 AM", checkout: "6:52 PM" },
    "26/08/2025": { checkin: "10:32 AM", checkout: "6:42 PM" },
    "27/08/2025": "Absent",
    "28/08/2025": { checkin: "10:36 AM", checkout: "6:40 PM" },
    "29/08/2025": { checkin: "10:53 AM", checkout: "6:46 PM" },
    "30/08/2025": { checkin: "10:28 AM", checkout: "6:43 PM" },
    "31/08/2025": "Absent"
  },
  Arjun: {
    "01/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "02/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "03/08/2025": "Sunday",
    "04/08/2025": "Absent",
    "05/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "06/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "07/08/2025": { checkin: "10:11 AM", checkout: "9:22 PM" },
    "08/08/2025": { checkin: "10:03 AM", checkout: "9:19 PM" },
    "09/08/2025": { checkin: "9:49 AM", checkout: "10:00 PM" },
    "10/08/2025": { checkin: "9:46 AM", checkout: "6:00 PM" },
    "11/08/2025": "Absent",
    "12/08/2025": { checkin: "10:28 AM", checkout: "11:06 PM" },
    "13/08/2025": { checkin: "10:14 AM", checkout: "10:21 PM" },
    "14/08/2025": { checkin: "10:17 AM", checkout: "8:19 PM" },
    "15/08/2025": { checkin: "10:23 AM", checkout: "6:00 PM" },
    "16/08/2025": "Sunday",
    "17/08/2025": "Absent",
    "18/08/2025": { checkin: "10:41 AM", checkout: "6:00 PM" },
    "19/08/2025": { checkin: "10:41 AM", checkout: "6:00 PM" },
    "20/08/2025": { checkin: "10:16 AM", checkout: "6:00 PM" },
    "21/08/2025": { checkin: "10:15 AM", checkout: "6:00 PM" },
    "22/08/2025": { checkin: "10:11 AM", checkout: "6:00 PM" },
    "23/08/2025": { checkin: "9:42 AM", checkout: "6:00 PM" },
    "24/08/2025": { checkin: "9:57 AM", checkout: "6:00 PM" },
    "25/08/2025": { checkin: "10:14 AM", checkout: "6:00 PM" },
    "26/08/2025": { checkin: "10:14 AM", checkout: "6:00 PM" },
    "27/08/2025": "Absent",
    "28/08/2025": { checkin: "10:14 AM", checkout: "6:00 PM" },
    "29/08/2025": { checkin: "10:14 AM", checkout: "6:00 PM" },
    "30/08/2025": "Absent",
    "31/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" }
  },
  Aman: {
    "01/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "02/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "03/08/2025": "Sunday",
    "04/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "05/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "06/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "07/08/2025": { checkin: "10:21 AM", checkout: "6:55 PM" },
    "08/08/2025": { checkin: "10:03 AM", checkout: "8:13 PM" },
    "09/08/2025": { checkin: "10:05 AM", checkout: "7:49 PM" },
    "10/08/2025": { checkin: "9:55 AM", checkout: "9:21 PM" },
    "11/08/2025": "Sunday",
    "12/08/2025": { checkin: "10:19 AM", checkout: "8:48 PM" },
    "13/08/2025": { checkin: "10:04 AM", checkout: "8:14 PM" },
    "14/08/2025": { checkin: "10:18 AM", checkout: "9:39 PM" },
    "15/08/2025": { checkin: "10:16 AM", checkout: "6:00 PM" },
    "16/08/2025": { checkin: "10:15 AM", checkout: "7:54 PM" },
    "17/08/2025": "Sunday",
    "18/08/2025": { checkin: "10:11 AM", checkout: "6:00 PM" },
    "19/08/2025": { checkin: "9:42 AM", checkout: "6:00 PM" },
    "20/08/2025": { checkin: "9:57 AM", checkout: "6:00 PM" },
    "21/08/2025": { checkin: "10:14 AM", checkout: "6:00 PM" },
    "22/08/2025": { checkin: "10:14 AM", checkout: "6:00 PM" },
    "23/08/2025": "Absent",
    "24/08/2025": { checkin: "10:14 AM", checkout: "6:00 PM" },
    "25/08/2025": { checkin: "10:14 AM", checkout: "6:00 PM" },
    "26/08/2025": "Absent",
    "27/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "28/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "29/08/2025": "Absent",
    "30/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" },
    "31/08/2025": { checkin: "10:00 AM", checkout: "6:00 PM" }
  }
};
    


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

        if (holidays.some((h: { date: string; name: string }) => h.date === formattedDate)) return;
        
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

export async function seedInitialData() {
  if (dataSeeded) return;

  // Only seed if the database is empty
  if (db.data!.employees.length > 0) {
    dataSeeded = true;
    return;
  }

  // Initialize empty collections
  db.data!.employees = [];
  db.data!.attendance_records = [];
  db.data!.holidays = [];

  // Add employees
  db.data!.employees = [...mockEmployees];

  // Add holidays
  db.data!.holidays = [...holidays];

  // Create a temporary Map to store attendance records during processing
  const tempAttendanceStore = new Map<string, AttendanceRecord[]>();

  // Process attendance data for each employee
  mockEmployees.forEach((employee: Employee) => {
    if (!tempAttendanceStore.has(employee.id)) {
      tempAttendanceStore.set(employee.id, []);
    }
    processAttendanceData(julyData, employee, tempAttendanceStore);
    processAttendanceData(augustData, employee, tempAttendanceStore);
    processAttendanceData(septemberData, employee, tempAttendanceStore);
  });

  // Flatten all attendance records into a single array
  db.data!.attendance_records = Array.from(tempAttendanceStore.values()).flat();

  // Sort attendance records by date
  db.data!.attendance_records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Write the changes to disk
  await db.write();
  
  dataSeeded = true;
}
