import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Employee, AttendanceRecord } from '@/lib/types';
import { format } from 'date-fns';

interface DatabaseContextType {
    // Employee operations
    employees: Employee[];
    updateEmployee: (employee: Employee) => Promise<void>;
    addEmployee: (employee: Employee) => Promise<void>;
    
    // Holiday operations
    holidays: { date: string; name: string }[];
    addHoliday: (holiday: { date: string; name: string }) => Promise<void>;
    removeHoliday: (date: string) => Promise<void>;
    
    // Attendance operations
    attendanceRecords: Map<string, AttendanceRecord[]>;
    todayAttendance: Map<string, AttendanceRecord>;
    updateAttendance: (record: AttendanceRecord) => Promise<void>;
    updateMultipleAttendance: (records: AttendanceRecord[]) => Promise<void>; // Add this
    
    // State
    isLoading: boolean;
    refreshData: () => Promise<void>;
    currentDateStr: string;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [holidays, setHolidays] = useState<{ date: string; name: string }[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord[]>>(new Map());
    const [todayAttendance, setTodayAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [currentDateStr, setCurrentDateStr] = useState("");

    const refreshData = async () => {
        setIsLoading(true);
        try {
            // Set today's date string consistently (local date)
            const now = new Date();
            const today = format(now, 'yyyy-MM-dd');
            setCurrentDateStr(today);
            
            // Fetch employees
            const empResponse = await fetch('/api/employees');
            if (!empResponse.ok) throw new Error('Failed to fetch employees');
            const empData = await empResponse.json();
            setEmployees(empData);

            // Fetch holidays
            const holidayResponse = await fetch('/api/holidays');
            if (!holidayResponse.ok) throw new Error('Failed to fetch holidays');
            const holidayData = await holidayResponse.json();
            setHolidays(holidayData);

            // Fetch all attendance records
            const attResponse = await fetch('/api/attendance');
            if (!attResponse.ok) throw new Error('Failed to fetch attendance');
            const attData: AttendanceRecord[] = await attResponse.json();
            
            // Group attendance records by employee
            const recordMap = new Map<string, AttendanceRecord[]>();
            attData.forEach(record => {
                const employeeRecords = recordMap.get(record.employeeId) || [];
                employeeRecords.push(record);
                recordMap.set(record.employeeId, employeeRecords);
            });
            setAttendanceRecords(recordMap);

            // Set today's attendance
            const todayResponse = await fetch(`/api/attendance?date=${today}`);
            if (!todayResponse.ok) throw new Error('Failed to fetch today\'s attendance');
            const todayData: AttendanceRecord[] = await todayResponse.json();
            
            const todayMap = new Map<string, AttendanceRecord>();
            todayData.forEach(record => {
                todayMap.set(record.employeeId, record);
            });
            setTodayAttendance(todayMap);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const updateEmployee = async (employee: Employee) => {
        const response = await fetch(`/api/employees/${employee.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee)
        });

        if (!response.ok) {
            throw new Error('Failed to update employee');
        }

        await refreshData();
    };

    const addEmployee = async (employee: Employee) => {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee)
        });

        if (!response.ok) {
            throw new Error('Failed to add employee');
        }

        await refreshData();
    };

    const updateAttendance = async (record: AttendanceRecord) => {
        const response = await fetch(`/api/attendance/${record.employeeId}/${record.date}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });

        if (!response.ok) {
            throw new Error('Failed to update attendance');
        }

        // Removed refreshData() from here
    };

    const updateMultipleAttendance = async (records: AttendanceRecord[]) => {
        const updatePromises = records.map(record => 
            fetch(`/api/attendance/${record.employeeId}/${record.date}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to update attendance for ${record.employeeName} on ${record.date}`);
                }
                return response;
            })
        );

        await Promise.all(updatePromises);
        await refreshData(); // Refresh once after all updates
    };

    const addHoliday = async (holiday: { date: string; name: string }) => {
        const response = await fetch('/api/holidays', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(holiday)
        });

        if (!response.ok) {
            throw new Error('Failed to add holiday');
        }

        await refreshData();
    };

    const removeHoliday = async (date: string) => {
        const response = await fetch(`/api/holidays/${date}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to remove holiday');
        }

        await refreshData();
    };

    const value = {
        employees,
        updateEmployee,
        addEmployee,
        holidays,
        addHoliday,
        removeHoliday,
        attendanceRecords,
        todayAttendance,
        updateAttendance,
        updateMultipleAttendance, // Add this
        isLoading,
        refreshData,
        currentDateStr
    };

    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    );
}

// Hook for accessing database context
export function useDatabase() {
    const context = useContext(DatabaseContext);
    if (!context) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
}

// Backward compatibility hook
export function useData() {
    return useDatabase();
}