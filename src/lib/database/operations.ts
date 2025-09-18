import Database from 'better-sqlite3';
import { join } from 'path';
import type { Employee, AttendanceRecord } from '@/lib/types';

// Initialize database connection
export const db = new Database(join(process.cwd(), 'attendance.db'));
db.pragma('foreign_keys = ON');

// Employee Operations
export const EmployeeOperations = {
    getAll: () => {
        return db.prepare('SELECT * FROM employees ORDER BY name').all();
    },

    getById: (id: string) => {
        return db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    },

    create: (employee: Employee) => {
        const stmt = db.prepare(`
            INSERT INTO employees (
                id, name, role, phone, gender, experience,
                avatarUrl, birthday, employed, hourlyPayRate, trackAttendance, ptoDays
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            employee.id,
            employee.name,
            employee.role,
            employee.phone,
            employee.gender,
            employee.experience,
            employee.avatarUrl,
            employee.birthday,
            employee.employed ? 1 : 0,
            employee.hourlyPayRate || null,
            employee.trackAttendance ? 1 : 0,
            employee.ptoDays ?? 0
        );
    },

    update: (employee: Employee) => {
        const stmt = db.prepare(`
            UPDATE employees SET
                name = ?,
                role = ?,
                phone = ?,
                gender = ?,
                experience = ?,
                avatarUrl = ?,
                birthday = ?,
                employed = ?,
                hourlyPayRate = ?,
                trackAttendance = ?,
                ptoDays = ?
            WHERE id = ?
        `);

        return stmt.run(
            employee.name,
            employee.role,
            employee.phone,
            employee.gender,
            employee.experience,
            employee.avatarUrl,
            employee.birthday,
            employee.employed ? 1 : 0,
            employee.hourlyPayRate || null,
            employee.trackAttendance ? 1 : 0,
            employee.ptoDays ?? 0,
            employee.id
        );
    },

    delete: (id: string) => {
        return db.prepare('DELETE FROM employees WHERE id = ?').run(id);
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
    getAll: () => {
        return db.prepare('SELECT * FROM attendance_records ORDER BY date DESC').all();
    },

    getByEmployeeId: (employeeId: string) => {
        return db.prepare(
            'SELECT * FROM attendance_records WHERE employeeId = ? ORDER BY date DESC'
        ).all(employeeId);
    },

    getByDate: (date: string) => {
        return db.prepare(
            'SELECT * FROM attendance_records WHERE date = ?'
        ).all(date);
    },

    create: (record: AttendanceRecord) => {
        const hoursWorked = calculateCappedHours(record.checkInTime, record.checkOutTime) ?? null;
        const stmt = db.prepare(`
            INSERT INTO attendance_records (
                id, employeeId, employeeName, date,
                status, checkInTime, checkOutTime, hoursWorked
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            `${record.employeeId}-${record.date}`,
            record.employeeId,
            record.employeeName,
            record.date,
            record.status,
            record.checkInTime,
            record.checkOutTime,
            hoursWorked
        );
    },

    update: (record: AttendanceRecord) => {
        const hoursWorked = calculateCappedHours(record.checkInTime, record.checkOutTime) ?? null;
        // First try to update existing record
        const updateStmt = db.prepare(`
            UPDATE attendance_records SET
                status = ?,
                checkInTime = ?,
                checkOutTime = ?,
                hoursWorked = ?
            WHERE employeeId = ? AND date = ?
        `);

        const updateResult = updateStmt.run(
            record.status,
            record.checkInTime,
            record.checkOutTime,
            hoursWorked,
            record.employeeId,
            record.date
        );

        // If no rows were affected, create a new record
        if (updateResult.changes === 0) {
            const insertStmt = db.prepare(`
                INSERT INTO attendance_records 
                (id, employeeId, employeeName, date, status, checkInTime, checkOutTime, hoursWorked)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            return insertStmt.run(
                `${record.employeeId}-${record.date}`,
                record.employeeId,
                record.employeeName,
                record.date,
                record.status,
                record.checkInTime,
                record.checkOutTime,
                hoursWorked
            );
        }

        return updateResult;
    },

    // Bulk operations for efficiency
    bulkCreate: (records: AttendanceRecord[]) => {
        const insert = db.prepare(`
            INSERT INTO attendance_records (
                id, employeeId, employeeName, date,
                status, checkInTime, checkOutTime, hoursWorked
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction((records: AttendanceRecord[]) => {
            for (const record of records) {
                const hoursWorked = calculateCappedHours(record.checkInTime, record.checkOutTime) ?? null;
                insert.run(
                    `${record.employeeId}-${record.date}`,
                    record.employeeId,
                    record.employeeName,
                    record.date,
                    record.status,
                    record.checkInTime,
                    record.checkOutTime,
                    hoursWorked
                );
            }
        });

        return insertMany(records);
    },

    // Get attendance summary for a date range
    getDateRangeSummary: (startDate: string, endDate: string) => {
        return db.prepare(`
            SELECT 
                employeeId,
                employeeName,
                COUNT(*) as totalDays,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentDays,
                SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateDays,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentDays,
                SUM(hoursWorked) as totalHoursWorked
            FROM attendance_records
            WHERE date BETWEEN ? AND ?
            GROUP BY employeeId, employeeName
        `).all(startDate, endDate);
    }
};

// Holiday Operations
export const HolidayOperations = {
    getAll: () => {
        return db.prepare('SELECT * FROM holidays ORDER BY date').all();
    },

    create: (holiday: { date: string; name: string }) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO holidays (date, name)
            VALUES (?, ?)
        `);
        return stmt.run(holiday.date, holiday.name);
    },

    delete: (date: string) => {
        return db.prepare('DELETE FROM holidays WHERE date = ?').run(date);
    }
};

