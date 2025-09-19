import Database from 'better-sqlite3';
import path from 'path';
import { Employee, AttendanceRecord } from '@/lib/types';

// Initialize database
const db = new Database(path.join(process.cwd(), 'attendance.db'), { verbose: console.log });

// Enable foreign key support
db.pragma('foreign_keys = ON');

export class DatabaseService {
    // Employee operations
    static getEmployees(): Employee[] {
        return db.prepare('SELECT * FROM employees').all() as Employee[];
    }

    static getEmployee(id: string): Employee | undefined {
        return db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as Employee | undefined;
    }

    static updateEmployee(employee: Employee): void {
        const stmt = db.prepare(`
            UPDATE employees 
            SET name = ?, role = ?, phone = ?, gender = ?, experience = ?, 
                avatarUrl = ?, birthday = ?, employed = ?
            WHERE id = ?
        `);
        stmt.run(
            employee.name,
            employee.role,
            employee.phone,
            employee.gender,
            employee.experience,
            employee.avatarUrl,
            employee.birthday,
            employee.employed,
            employee.id
        );
    }

    static addEmployee(employee: Employee): void {
        const stmt = db.prepare(`
            INSERT INTO employees (id, name, role, phone, gender, experience, avatarUrl, birthday, employed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            employee.id,
            employee.name,
            employee.role,
            employee.phone,
            employee.gender,
            employee.experience,
            employee.avatarUrl,
            employee.birthday,
            employee.employed
        );
    }

    // Holiday operations
    static getHolidays(): { date: string; name: string }[] {
        return db.prepare('SELECT * FROM holidays ORDER BY date').all() as { date: string; name: string }[];
    }

    static addHoliday(holiday: { date: string; name: string }): void {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO holidays (date, name)
            VALUES (?, ?)
        `);
        stmt.run(holiday.date, holiday.name);
    }

    static removeHoliday(date: string): void {
        db.prepare('DELETE FROM holidays WHERE date = ?').run(date);
    }

    // Attendance operations
    static getAttendanceRecords(employeeId?: string): AttendanceRecord[] {
        if (employeeId) {
            return db.prepare('SELECT * FROM attendance_records WHERE employeeId = ? ORDER BY date').all(employeeId) as AttendanceRecord[];
        }
        return db.prepare('SELECT * FROM attendance_records ORDER BY date').all() as AttendanceRecord[];
    }

    static getAttendanceByDate(date: string): AttendanceRecord[] {
        return db.prepare('SELECT * FROM attendance_records WHERE date = ?').all(date) as AttendanceRecord[];
    }

    static addAttendanceRecord(record: AttendanceRecord): void {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO attendance_records 
            (id, employeeId, employeeName, date, status, checkInTime, checkOutTime)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            record.id || `${record.employeeId}-${record.date}`,
            record.employeeId,
            record.employeeName,
            record.date,
            record.status,
            record.checkInTime,
            record.checkOutTime
        );
    }

    static updateAttendanceRecord(record: AttendanceRecord): void {
        const stmt = db.prepare(`
            UPDATE attendance_records 
            SET status = ?, checkInTime = ?, checkOutTime = ?
            WHERE employeeId = ? AND date = ?
        `);
        stmt.run(
            record.status,
            record.checkInTime,
            record.checkOutTime,
            record.employeeId,
            record.date
        );
    }
}
