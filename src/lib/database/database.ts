import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { Employee, AttendanceRecord } from '@/lib/types';

interface Data {
  employees: Employee[];
  attendance_records: AttendanceRecord[];
  holidays: { date: string; name: string }[];
}

export let db: Low<Data>;

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

export async function initializeDatabase() {
    const file = path.join(process.cwd(), 'kiki.json');
    
    // Ensure the directory exists
    try {
        await mkdir(path.dirname(file), { recursive: true });
    } catch (err) {
        // Ignore error if directory already exists
        if ((err as any).code !== 'EEXIST') {
            throw err;
        }
    }

    // Create empty JSON file if it doesn't exist
    if (!existsSync(file)) {
        const defaultData = {
            employees: [],
            attendance_records: [],
            holidays: []
        };
        await writeFile(file, JSON.stringify(defaultData, null, 2));
    }

    const adapter = new JSONFile<Data>(file);
    db = new Low<Data>(adapter, {
        employees: [],
        attendance_records: [],
        holidays: []
    });
    
    try {
        await db.read();
        if (!db.data) {
            db.data = {
                employees: [],
                attendance_records: [],
                holidays: []
            };
            await db.write();
        }
    } catch (err) {
        console.error('Error reading database:', err);
        // Reset to default data if there's an error
        db.data = {
            employees: [],
            attendance_records: [],
            holidays: []
        };
        await db.write();
    }
}

export class DatabaseService {
    // Employee operations
    static async getEmployees(): Promise<Employee[]> {
        return db.data!.employees;
    }

    static async getEmployee(id: string): Promise<Employee | undefined> {
        return db.data!.employees.find(employee => employee.id === id);
    }

    static async updateEmployee(employee: Employee): Promise<void> {
        const index = db.data!.employees.findIndex(e => e.id === employee.id);
        if (index !== -1) {
            db.data!.employees[index] = { ...db.data!.employees[index], ...employee };
            await db.write();
        }
    }

    static async addEmployee(employee: Employee): Promise<void> {
        db.data!.employees.push(employee);
        await db.write();
    }

    // Holiday operations
    static async getHolidays(): Promise<{ date: string; name: string }[]> {
        return db.data!.holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    static async addHoliday(holiday: { date: string; name: string }): Promise<void> {
        const existingIndex = db.data!.holidays.findIndex(h => h.date === holiday.date);
        if (existingIndex !== -1) {
            db.data!.holidays[existingIndex] = holiday;
        } else {
            db.data!.holidays.push(holiday);
        }
        await db.write();
    }

    static async removeHoliday(date: string): Promise<void> {
        db.data!.holidays = db.data!.holidays.filter(holiday => holiday.date !== date);
        await db.write();
    }

    // Attendance operations
    static async getAttendanceRecords(employeeId?: string): Promise<AttendanceRecord[]> {
        if (employeeId) {
            return db.data!.attendance_records.filter(record => record.employeeId === employeeId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        return db.data!.attendance_records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    static async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
        return db.data!.attendance_records.filter(record => record.date === date);
    }

    static async addAttendanceRecord(record: AttendanceRecord): Promise<void> {
        const existingIndex = db.data!.attendance_records.findIndex(r => r.employeeId === record.employeeId && r.date === record.date);
        if (existingIndex !== -1) {
            db.data!.attendance_records[existingIndex] = record;
        } else {
            db.data!.attendance_records.push(record);
        }
        await db.write();
    }

    static async updateAttendanceRecord(record: AttendanceRecord): Promise<void> {
        const index = db.data!.attendance_records.findIndex(r => r.employeeId === record.employeeId && r.date === record.date);
        if (index !== -1) {
            db.data!.attendance_records[index] = { ...db.data!.attendance_records[index], ...record };
            await db.write();
        }
    }
}
