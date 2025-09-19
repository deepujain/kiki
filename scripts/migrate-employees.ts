import { join } from 'path';
import { promises as fs } from 'fs';
import Database from 'better-sqlite3';
import { employees } from '../src/lib/data';

async function migrateEmployees() {
    const dbPath = join(process.cwd(), 'attendance.db');
    const db = new Database(dbPath);

    try {
        // Begin transaction for data migration
        const migration = db.transaction(() => {
            // Migrate employees
            const insertEmployee = db.prepare(`
                INSERT INTO employees (id, name, role, phone, gender, experience, avatarUrl, birthday, employed, hourlyPayRate, trackAttendance)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    employee.employed ? 1 : 0,
                    employee.hourlyPayRate || null,
                    employee.trackAttendance ? 1 : 0
                );
            }
        });
        
        // Execute migration
        migration();
        
        console.log('Employee data migration completed successfully.');
    } catch (error: any) {
        console.error('Employee data migration failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        throw error;
    } finally {
        db.close();
    }
}

migrateEmployees().catch(error => {
    console.error('Employee migration failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', JSON.stringify(reason, Object.getOwnPropertyNames(reason)));
    process.exit(1);
});
