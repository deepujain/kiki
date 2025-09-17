import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function migrateDatabase() {
    const dbPath = join(projectRoot, 'kiki.db');
    
    // Create new database
    const db = new Database(dbPath);
    
    try {
        // Read and execute schema
        const schema = await fs.readFile(
            join(projectRoot, 'src', 'lib', 'database', 'schema.sql'),
            'utf8'
        );
        
        // Enable foreign keys
        db.pragma('foreign_keys = ON');
        
        // Execute schema
        db.exec(schema);
        
        // Import data dynamically
        const { employees } = await import('../src/lib/data.js');
        const { holidays } = await import('../src/lib/holidays.js');
        const { allTimeAttendanceStore } = await import('../src/lib/store.js');
        
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
                    employee.employed
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
