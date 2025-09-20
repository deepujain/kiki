import { AttendanceOperations } from "../src/lib/database/operations.js";
import { join } from "path";
import { promises as fs } from "fs";

async function getAttendanceRecords() {
    try {
        await AttendanceOperations.getAll();
        console.log("Fetched attendance records successfully");
    } catch (error: any) {
        console.error(
            "Failed to fetch attendance records:",
            JSON.stringify(error, Object.getOwnPropertyNames(error))
        );
        process.exit(1);
    }
}

getAttendanceRecords().catch((error) => {
    console.error(
        "Unhandled error in getAttendanceRecords:",
        JSON.stringify(error, Object.getOwnPropertyNames(error))
    );
    process.exit(1);
});

