import { NextResponse } from 'next/server';
import { AttendanceOperations } from '@/lib/database/operations';
import type { AttendanceRecord } from '@/lib/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const date = searchParams.get('date');
        
        let records;
        if (employeeId) {
            records = await AttendanceOperations.getByEmployeeId(employeeId);
        } else if (date) {
            records = await AttendanceOperations.getByDate(date);
        } else {
            records = await AttendanceOperations.getAll();
        }
        
        // Ensure records is an array
        if (!Array.isArray(records)) {
            records = [];
        }
        
        return NextResponse.json(records);
    } catch (error) {
        console.error('Failed to fetch attendance records:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance records' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const record: AttendanceRecord = await request.json();
        
        // Validate required fields
        if (!record.employeeId || !record.date || !record.status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const records = await AttendanceOperations.getByEmployeeId(record.employeeId);
        const existingRecord = records.find(r => r.date === record.date);
        let result;

        if (existingRecord) {
            // Update existing record
            await AttendanceOperations.update(record);
            result = record;
        } else {
            // Create new record
            await AttendanceOperations.create(record);
            result = record;
        }
        
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to create attendance record:', error);
        return NextResponse.json(
            { error: 'Failed to create attendance record' },
            { status: 500 }
        );
    }
}
