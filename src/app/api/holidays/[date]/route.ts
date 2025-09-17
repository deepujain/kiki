import { NextRequest, NextResponse } from 'next/server';
import { HolidayOperations } from '@/lib/database/operations';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ date: string }> }
) {
    try {
        const params = await context.params;
        const result = HolidayOperations.delete(params.date);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to delete holiday:', error);
        return NextResponse.json(
            { error: 'Failed to delete holiday' },
            { status: 500 }
        );
    }
}