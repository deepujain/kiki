import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'kiki.db'));

console.log('\nDatabase Record Counts:');
console.log('---------------------');

const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees').get();
console.log(`Employees: ${employeeCount.count}`);

const holidayCount = db.prepare('SELECT COUNT(*) as count FROM holidays').get();
console.log(`Holidays: ${holidayCount.count}`);

const attendanceCount = db.prepare('SELECT COUNT(*) as count FROM attendance_records').get();
console.log(`Attendance Records: ${attendanceCount.count}`);

console.log('\nSample Records:');
console.log('--------------');

console.log('\nEmployees:');
const employees = db.prepare('SELECT * FROM employees LIMIT 3').all();
console.log(employees);

console.log('\nHolidays:');
const holidays = db.prepare('SELECT * FROM holidays').all();
console.log(holidays);

console.log('\nAttendance Records (first 3):');
const attendance = db.prepare('SELECT * FROM attendance_records LIMIT 3').all();
console.log(attendance);
