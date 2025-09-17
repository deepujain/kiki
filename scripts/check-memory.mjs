import { employees } from '../src/lib/data.js';
import { holidays } from '../src/lib/holidays.js';
import { allTimeAttendanceStore } from '../src/lib/store.js';

console.log('\nIn-Memory Store Counts:');
console.log('---------------------');
console.log(`Employees: ${employees.length}`);
console.log(`Holidays: ${holidays.length}`);

let totalAttendance = 0;
for (const [_, records] of allTimeAttendanceStore.entries()) {
    totalAttendance += records.length;
}
console.log(`Attendance Records: ${totalAttendance}`);

console.log('\nSample Records:');
console.log('--------------');

console.log('\nEmployees (first 3):');
console.log(employees.slice(0, 3));

console.log('\nHolidays:');
console.log(holidays);

console.log('\nAttendance Records (first 3 for first employee):');
const firstEmployeeRecords = allTimeAttendanceStore.get(employees[0].id) || [];
console.log(firstEmployeeRecords.slice(0, 3));
