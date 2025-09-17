import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Import data dynamically to handle ESM
const { employees } = await import('../src/lib/data.js');
const { holidays } = await import('../src/lib/holidays.js');
const { allTimeAttendanceStore } = await import('../src/lib/store.js');

function compareEmployees() {
    const db = new Database(join(projectRoot, 'kiki.db'));
    
    console.log('\n📊 EMPLOYEES VERIFICATION');
    console.log('=======================');
    
    // Count comparison
    const memoryCount = employees.length;
    const dbCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
    
    console.log('\nCount Comparison:');
    console.log(`Memory: ${memoryCount} records`);
    console.log(`Database: ${dbCount} records`);
    console.log(`Match: ${memoryCount === dbCount ? '✅' : '❌'}`);

    // Detailed data comparison
    console.log('\nDetailed Comparison:');
    const dbEmployees = db.prepare('SELECT * FROM employees ORDER BY id').all();
    
    employees.forEach((memEmployee, index) => {
        const dbEmployee = dbEmployees[index];
        console.log(`\nEmployee ${memEmployee.id} (${memEmployee.name}):`);
        console.log('Memory:', memEmployee);
        console.log('Database:', dbEmployee);
        
        // Compare each field
        const fieldsMatch = 
            memEmployee.id === dbEmployee.id &&
            memEmployee.name === dbEmployee.name &&
            memEmployee.role === dbEmployee.role &&
            memEmployee.phone === dbEmployee.phone &&
            memEmployee.gender === dbEmployee.gender &&
            memEmployee.experience === dbEmployee.experience &&
            memEmployee.avatarUrl === dbEmployee.avatarUrl &&
            memEmployee.birthday === dbEmployee.birthday &&
            memEmployee.employed === Boolean(dbEmployee.employed);
        
        console.log(`Data Match: ${fieldsMatch ? '✅' : '❌'}`);
    });
}

function compareHolidays() {
    const db = new Database(join(projectRoot, 'kiki.db'));
    
    console.log('\n📅 HOLIDAYS VERIFICATION');
    console.log('======================');
    
    // Count comparison
    const memoryCount = holidays.length;
    const dbCount = db.prepare('SELECT COUNT(*) as count FROM holidays').get().count;
    
    console.log('\nCount Comparison:');
    console.log(`Memory: ${memoryCount} records`);
    console.log(`Database: ${dbCount} records`);
    console.log(`Match: ${memoryCount === dbCount ? '✅' : '❌'}`);

    // Detailed data comparison
    console.log('\nDetailed Comparison:');
    const dbHolidays = db.prepare('SELECT * FROM holidays ORDER BY date').all();
    
    holidays.forEach((memHoliday, index) => {
        const dbHoliday = dbHolidays[index];
        console.log(`\nHoliday on ${memHoliday.date}:`);
        console.log('Memory:', memHoliday);
        console.log('Database:', dbHoliday);
        
        // Compare each field
        const fieldsMatch = 
            memHoliday.date === dbHoliday.date &&
            memHoliday.name === dbHoliday.name;
        
        console.log(`Data Match: ${fieldsMatch ? '✅' : '❌'}`);
    });
}

function compareAttendance() {
    const db = new Database(join(projectRoot, 'kiki.db'));
    
    console.log('\n📝 ATTENDANCE VERIFICATION');
    console.log('=========================');
    
    // Count total attendance records in memory
    let memoryCount = 0;
    for (const [_, records] of allTimeAttendanceStore.entries()) {
        memoryCount += records.length;
    }
    
    // Get database count
    const dbCount = db.prepare('SELECT COUNT(*) as count FROM attendance_records').get().count;
    
    console.log('\nCount Comparison:');
    console.log(`Memory: ${memoryCount} records`);
    console.log(`Database: ${dbCount} records`);
    console.log(`Match: ${memoryCount === dbCount ? '✅' : '❌'}`);

    // Detailed comparison for each employee
    console.log('\nDetailed Comparison by Employee:');
    
    for (const [employeeId, memoryRecords] of allTimeAttendanceStore.entries()) {
        const dbRecords = db.prepare('SELECT * FROM attendance_records WHERE employeeId = ? ORDER BY date')
            .all(employeeId);
        
        console.log(`\nEmployee ID: ${employeeId}`);
        console.log(`Memory Records: ${memoryRecords.length}`);
        console.log(`Database Records: ${dbRecords.length}`);
        
        // Compare first and last record for each employee
        if (memoryRecords.length > 0) {
            const firstMemRecord = memoryRecords[0];
            const firstDbRecord = dbRecords[0];
            
            console.log('\nFirst Record Comparison:');
            console.log('Memory:', firstMemRecord);
            console.log('Database:', firstDbRecord);
            
            const fieldsMatch = 
                firstMemRecord.employeeId === firstDbRecord.employeeId &&
                firstMemRecord.employeeName === firstDbRecord.employeeName &&
                firstMemRecord.date === firstDbRecord.date &&
                firstMemRecord.status === firstDbRecord.status &&
                firstMemRecord.checkInTime === firstDbRecord.checkInTime &&
                firstMemRecord.checkOutTime === firstDbRecord.checkOutTime;
            
            console.log(`Data Match: ${fieldsMatch ? '✅' : '❌'}`);
        }
    }
}

console.log('\n🔍 STARTING VERIFICATION');
console.log('======================');

try {
    compareEmployees();
    compareHolidays();
    compareAttendance();
    
    console.log('\n✨ VERIFICATION COMPLETE');
    console.log('======================');
} catch (error) {
    console.error('\n❌ VERIFICATION FAILED');
    console.error(error);
    process.exit(1);
}
