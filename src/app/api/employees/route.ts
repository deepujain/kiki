import { NextResponse } from 'next/server';
import { EmployeeOperations } from '@/lib/database/operations';
import type { Employee } from '@/lib/types';

export async function GET() {
    try {
        const employees = await EmployeeOperations.getAll();
        return NextResponse.json(employees);
    } catch (error) {
        console.error('Failed to fetch employees:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employees' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const employee: Employee = await request.json();
        
        // Validate required fields
        if (!employee.id || !employee.name || !employee.role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await EmployeeOperations.create(employee);
        const result = employee;
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to create employee:', error);
        return NextResponse.json(
            { error: 'Failed to create employee' },
            { status: 500 }
        );
    }
}
