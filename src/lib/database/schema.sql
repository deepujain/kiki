-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT NOT NULL,
    gender TEXT NOT NULL,
    experience INTEGER NOT NULL,
    avatarUrl TEXT NOT NULL,
    birthday TEXT NOT NULL,
    employed BOOLEAN NOT NULL DEFAULT true
);

-- Holidays table
CREATE TABLE IF NOT EXISTS holidays (
    date TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Present', 'Late', 'Absent', 'Not Marked')),
    checkInTime TEXT,
    checkOutTime TEXT,
    FOREIGN KEY (employeeId) REFERENCES employees(id),
    UNIQUE(employeeId, date)
);
