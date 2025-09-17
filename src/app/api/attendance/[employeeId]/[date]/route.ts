import { NextRequest, NextResponse } from 'next/server';
import { AttendanceOperations } from '@/lib/database/operations';
import type { AttendanceRecord } from '@/lib/types';

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ employeeId: string; date: string }> }
) {
    try {
        const params = await context.params;
        const record: AttendanceRecord = await request.json();
        
        // Access params after awaiting
        if (record.employeeId !== params.employeeId || 
            record.date !== params.date) {
            return NextResponse.json(
                { error: 'Attendance record parameters mismatch' },
                { status: 400 }
            );
        }

        const result = AttendanceOperations.update(record);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to update attendance record:', error);
        return NextResponse.json(
            { error: 'Failed to update attendance record' },
            { status: 500 }
        );
    }
}