import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import Database from 'better-sqlite3';
import { employees } from '../src/lib/data';
import { holidays } from '../src/lib/holidays';
import { allTimeAttendanceStore } from '../src/lib/store';
import type { AttendanceRecord } from '../src/lib/types';

async function migrateDatabase() {
    const dbPath = join(process.cwd(), 'kiki.db');
    
    // Remove existing database file if it exists
    try {
        await fs.unlink(dbPath);
        console.log(`Removed existing database: ${dbPath}`);
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            console.error('Error removing database file:', error);
            process.exit(1);
        }
    }
    
    // Create new database
    const db = new Database(dbPath);
    
    try {
        // Read and execute schema
        const schema = await fs.readFile(
            join(process.cwd(), 'src', 'lib', 'database', 'schema.sql'),
            'utf8'
        );
        
        // Enable foreign keys
        db.pragma('foreign_keys = ON');
        
        // Execute schema
        db.exec(schema);
        
        // Begin transaction for data migration
        const migration = db.transaction(() => {
            // Migrate employees
            const insertEmployee = db.prepare(`
                INSERT INTO employees (id, name, role, phone, gender, experience, avatarUrl, birthday, employed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            for (const employee of employees) {
                insertEmployee.run(
                    employee.id,
                    employee.name,
                    employee.role,
                    employee.phone,
                    employee.gender,
                    employee.experience,
                    employee.avatarUrl,
                    employee.birthday,
                    employee.employed ? 1 : 0
                );
            }
            
            // Migrate holidays
            const insertHoliday = db.prepare(`
                INSERT INTO holidays (date, name)
                VALUES (?, ?)
            `);
            
            for (const holiday of holidays) {
                insertHoliday.run(holiday.date, holiday.name);
            }
            
            // Migrate attendance records
            const insertAttendance = db.prepare(`
                INSERT INTO attendance_records (id, employeeId, employeeName, date, status, checkInTime, checkOutTime)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            
            for (const [employeeId, records] of allTimeAttendanceStore.entries()) {
                for (const record of records) {
                    insertAttendance.run(
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

            // Generate and migrate default attendance records for today for all employees
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

            const activeEmployees = employees.filter(e => e.employed && e.role !== 'Founder & CEO');

            for (const employee of activeEmployees) {
                // Check if a record for today already exists to avoid duplicates
                const existingRecord = db.prepare('SELECT id FROM attendance_records WHERE employeeId = ? AND date = ?').get(employee.id, todayStr);
                if (!existingRecord) {
                    insertAttendance.run(
                        `${employee.id}-${todayStr}`,
                        employee.id,
                        employee.name,
                        todayStr,
                        'Not Marked',
                        '--:--',
                        '--:--'
                    );
                }
            }
        });
        
        // Execute migration
        migration();
        
        console.log('Database migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        // Clean up on failure
        db.close();
        await fs.unlink(dbPath).catch(() => {});
        throw error;
    }
}

// Run migration
migrateDatabase().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
});
