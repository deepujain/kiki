import { NextRequest, NextResponse } from 'next/server';
import { HolidayOperations } from '@/lib/database/operations';

export async function GET() {
    try {
        const holidays = HolidayOperations.getAll();
        return NextResponse.json(holidays);
    } catch (error) {
        console.error('Failed to fetch holidays:', error);
        return NextResponse.json(
            { error: 'Failed to fetch holidays' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const holiday: { date: string; name: string } = await request.json();
        
        // Validate required fields
        if (!holiday.date || !holiday.name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = HolidayOperations.create(holiday);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to create holiday:', error);
        return NextResponse.json(
            { error: 'Failed to create holiday' },
            { status: 500 }
        );
    }
}
