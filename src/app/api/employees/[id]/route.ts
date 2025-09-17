import { NextRequest, NextResponse } from 'next/server';
import { EmployeeOperations } from '@/lib/database/operations';
import type { Employee } from '@/lib/types';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const employee = EmployeeOperations.getById(params.id);
        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(employee);
    } catch (error) {
        console.error('Failed to fetch employee:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employee' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const employee: Employee = await request.json();
        
        // Ensure ID matches using the awaited params
        if (employee.id !== params.id) {
            return NextResponse.json(
                { error: 'Employee ID mismatch' },
                { status: 400 }
            );
        }

        const result = EmployeeOperations.update(employee);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to update employee:', error);
        return NextResponse.json(
            { error: 'Failed to update employee' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const result = EmployeeOperations.delete(params.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to delete employee:', error);
        return NextResponse.json(
            { error: 'Failed to delete employee' },
            { status: 500 }
        );
    }
}