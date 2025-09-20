import { join } from 'path';
import { promises as fs } from 'fs';
import { open } from 'node:sqlite';
import sqlite3 from 'sqlite3';
import { allTimeAttendanceStore } from '../src/lib/store.js';
import type { AttendanceRecord } from '../src/lib/types.js';

async function migrateAttendance() {
    const dbPath = join(process.cwd(), 'attendance.db');
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    try {
        await db.run('BEGIN TRANSACTION');
        const insertAttendance = await db.prepare(`
            INSERT INTO attendance_records (id, employeeId, employeeName, date, status, checkInTime, checkOutTime)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
            
        for (const [employeeId, records] of allTimeAttendanceStore.entries()) {
            for (const record of records) {
                await insertAttendance.run(
                    `${record.employeeId}-${record.date}`,
                    record.employeeId,
                    record.employeeName,
                    record.date,
                    record.status,
                    record.checkInTime,
                    record.checkOutTime
                );
            }
        }
        await insertAttendance.finalize();
        await db.run('COMMIT');
        
        console.log('Attendance records migration completed successfully.');
    } catch (error: any) {
        console.error('Attendance records migration failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        await db.run('ROLLBACK');
        throw error;
    } finally {
        await db.close();
    }
}

migrateAttendance().catch(error => {
    console.error('Attendance migration failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', JSON.stringify(reason, Object.getOwnPropertyNames(reason)));
    process.exit(1);
});
