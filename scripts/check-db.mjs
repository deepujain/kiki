import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'kiki.db'));

console.log('\nChecking database tables...');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

console.log('\nChecking employees...');
try {
    const employees = db.prepare('SELECT COUNT(*) as count FROM employees').get();
    console.log('Employee count:', employees.count);
} catch (e) {
    console.log('No employees table or error:', e.message);
}

console.log('\nChecking attendance records...');
try {
    const attendance = db.prepare('SELECT COUNT(*) as count FROM attendance_records').get();
    console.log('Attendance record count:', attendance.count);
} catch (e) {
    console.log('No attendance_records table or error:', e.message);
}

console.log('\nChecking holidays...');
try {
    const holidays = db.prepare('SELECT COUNT(*) as count FROM holidays').get();
    console.log('Holiday count:', holidays.count);
} catch (e) {
    console.log('No holidays table or error:', e.message);
}

db.close();
