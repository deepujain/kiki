import Database from 'better-sqlite3';
import { join } from 'path';
import { employees } from '../src/lib/data';
import { holidays } from '../src/lib/holidays';
import { allTimeAttendanceStore } from '../src/lib/store';

function countAttendanceRecords(): number {
    let total = 0;
    for (const [_, records] of allTimeAttendanceStore.entries()) {
        total += records.length;
    }
    return total;
}

function verifyMigration() {
    console.log('\nIn-Memory Store Counts:');
    console.log('----------------------');
    console.log(`Employees: ${employees.length}`);
    console.log(`Holidays: ${holidays.length}`);
    const attendanceCount = countAttendanceRecords();
    console.log(`Attendance Records: ${attendanceCount}`);

    const db = new Database(join(process.cwd(), 'kiki.db'));
    
    console.log('\nDatabase Counts:');
    console.log('----------------');
    const dbEmployees = db.prepare('SELECT COUNT(*) as count FROM employees').get();
    console.log(`Employees: ${dbEmployees.count}`);
    
    const dbHolidays = db.prepare('SELECT COUNT(*) as count FROM holidays').get();
    console.log(`Holidays: ${dbHolidays.count}`);
    
    const dbAttendance = db.prepare('SELECT COUNT(*) as count FROM attendance_records').get();
    console.log(`Attendance Records: ${dbAttendance.count}`);

    console.log('\nVerification Results:');
    console.log('-------------------');
    console.log(`Employees Match: ${employees.length === dbEmployees.count ? '✅' : '❌'}`);
    console.log(`Holidays Match: ${holidays.length === dbHolidays.count ? '✅' : '❌'}`);
    console.log(`Attendance Records Match: ${attendanceCount === dbAttendance.count ? '✅' : '❌'}`);

    // Sample data verification
    console.log('\nSample Data Verification:');
    console.log('----------------------');
    
    // Check a sample employee
    const sampleEmployee = employees[0];
    const dbEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(sampleEmployee.id);
    console.log('\nSample Employee Comparison:');
    console.log('Memory:', sampleEmployee);
    console.log('Database:', dbEmployee);

    // Check a sample holiday
    if (holidays.length > 0) {
        const sampleHoliday = holidays[0];
        const dbHoliday = db.prepare('SELECT * FROM holidays WHERE date = ?').get(sampleHoliday.date);
        console.log('\nSample Holiday Comparison:');
        console.log('Memory:', sampleHoliday);
        console.log('Database:', dbHoliday);
    }

    // Check a sample attendance record
    const firstEmployeeId = employees[0].id;
    const memoryRecords = allTimeAttendanceStore.get(firstEmployeeId) || [];
    if (memoryRecords.length > 0) {
        const sampleAttendance = memoryRecords[0];
        const dbAttendance = db.prepare('SELECT * FROM attendance_records WHERE employeeId = ? AND date = ?')
            .get(sampleAttendance.employeeId, sampleAttendance.date);
        console.log('\nSample Attendance Record Comparison:');
        console.log('Memory:', sampleAttendance);
        console.log('Database:', dbAttendance);
    }
}

try {
    verifyMigration();
} catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
}
