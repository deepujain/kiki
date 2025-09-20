import { join } from 'path';
import type { Employee, AttendanceRecord } from '../types.js';
import { db, initializeDatabase } from './database';

// Ensure database is initialized
let isInitialized = false;
async function ensureInitialized() {
    if (!isInitialized) {
        await initializeDatabase();
        isInitialized = true;
    }
}

// Employee Operations
export const EmployeeOperations = {
    getAll: async (): Promise<Employee[]> => {
        await ensureInitialized();
        return db.data!.employees.sort((a, b) => a.name.localeCompare(b.name));
    },

    getById: async (id: string): Promise<Employee | undefined> => {
        await ensureInitialized();
        return db.data!.employees.find(employee => employee.id === id);
    },

    create: async (employee: Employee): Promise<void> => {
        await ensureInitialized();
        db.data!.employees.push(employee);
        await db.write();
    },

    update: async (employee: Employee): Promise<void> => {
        await ensureInitialized();
        const index = db.data!.employees.findIndex(e => e.id === employee.id);
        if (index !== -1) {
            db.data!.employees[index] = { ...db.data!.employees[index], ...employee };
            await db.write();
        }
    },

    delete: async (id: string): Promise<void> => {
        await ensureInitialized();
        db.data!.employees = db.data!.employees.filter(employee => employee.id !== id);
        await db.write();
    }
};

// Helper function to calculate hours worked and apply an 8-hour cap
function calculateCappedHours(checkInTime: string, checkOutTime?: string): number | undefined {
    if (!checkInTime || !checkOutTime) {
        return undefined;
    }

    try {
        const checkIn = new Date(`2000-01-01T${checkInTime}:00`);
        const checkOut = new Date(`2000-01-01T${checkOutTime}:00`);
        
        let hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

        // Cap hours at 8
        return Math.min(hours, 8);
    } catch (error) {
        console.error("Error calculating hours worked:", error);
        return undefined;
    }
}

// Attendance Operations
export const AttendanceOperations = {
    getAll: async (): Promise<AttendanceRecord[]> => {
        await ensureInitialized();
        return db.data!.attendance_records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    getByEmployeeId: async (employeeId: string): Promise<AttendanceRecord[]> => {
        await ensureInitialized();
        return db.data!.attendance_records.filter(record => record.employeeId === employeeId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    getByDate: async (date: string): Promise<AttendanceRecord[]> => {
        await ensureInitialized();
        return db.data!.attendance_records.filter(record => record.date === date);
    },

    create: async (record: AttendanceRecord): Promise<void> => {
        await ensureInitialized();
        const existingIndex = db.data!.attendance_records.findIndex(r => r.employeeId === record.employeeId && r.date === record.date);
        if (existingIndex !== -1) {
            db.data!.attendance_records[existingIndex] = record;
        } else {
            db.data!.attendance_records.push(record);
        }
        await db.write();
    },

    update: async (record: AttendanceRecord): Promise<void> => {
        await ensureInitialized();
        const index = db.data!.attendance_records.findIndex(r => r.employeeId === record.employeeId && r.date === record.date);
        if (index !== -1) {
            // Update existing record
            db.data!.attendance_records[index] = { ...db.data!.attendance_records[index], ...record };
        } else {
            // Create new record if it doesn't exist
            db.data!.attendance_records.push(record);
        }
        // Always write to database
        await db.write();
    },

    // Process records in a batch
    // so we'll simulate it by ensuring `db.write()` is called after all updates in a batch.
    bulkCreate: async (records: AttendanceRecord[]): Promise<void> => {
        await ensureInitialized();
        for (const record of records) {
            const hoursWorked = calculateCappedHours(record.checkInTime, record.checkOutTime) ?? null;
            const existingIndex = db.data!.attendance_records.findIndex(r => r.employeeId === record.employeeId && r.date === record.date);
            if (existingIndex !== -1) {
                db.data!.attendance_records[existingIndex] = { ...db.data!.attendance_records[existingIndex], ...record, hoursWorked };
            } else {
                db.data!.attendance_records.push({ ...record, hoursWorked });
            }
        }
        await db.write();
    },

    getDateRangeSummary: async (startDate: string, endDate: string) => {
        await ensureInitialized();
        const filteredRecords = db.data!.attendance_records.filter(record => record.date >= startDate && record.date <= endDate);

        const summaryMap = new Map<string, any>();

        filteredRecords.forEach(record => {
            const key = `${record.employeeId}-${record.employeeName}`;
            if (!summaryMap.has(key)) {
                summaryMap.set(key, {
                    employeeId: record.employeeId,
                    employeeName: record.employeeName,
                    totalDays: 0,
                    presentDays: 0,
                    lateDays: 0,
                    absentDays: 0,
                    totalHoursWorked: 0
                });
            }
            const summary = summaryMap.get(key);
            summary.totalDays++;
            if (record.status === 'Present') {
                summary.presentDays++;
            } else if (record.status === 'Late') {
                summary.lateDays++;
            } else if (record.status === 'Absent') {
                summary.absentDays++;
            }
            if (record.hoursWorked) {
                summary.totalHoursWorked += record.hoursWorked;
            }
        });

        return Array.from(summaryMap.values());
    }
};

// Holiday Operations
export const HolidayOperations = {
    getAll: async (): Promise<{ date: string; name: string }[]> => {
        await ensureInitialized();
        return db.data!.holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    create: async (holiday: { date: string; name: string }): Promise<void> => {
        await ensureInitialized();
        const existingIndex = db.data!.holidays.findIndex(h => h.date === holiday.date);
        if (existingIndex !== -1) {
            db.data!.holidays[existingIndex] = holiday;
        } else {
            db.data!.holidays.push(holiday);
        }
        await db.write();
    },

    delete: async (date: string): Promise<void> => {
        await ensureInitialized();
        db.data!.holidays = db.data!.holidays.filter(holiday => holiday.date !== date);
        await db.write();
    }
};

