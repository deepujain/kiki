import { NextRequest, NextResponse } from 'next/server';
import { HolidayOperations } from '@/lib/database/operations';

export async function GET() {
    try {
        const holidays = await HolidayOperations.getAll();
        if (!Array.isArray(holidays)) {
            return NextResponse.json([], { status: 200 });
        }
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

        await HolidayOperations.create(holiday);
        const result = holiday;
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to create holiday:', error);
        return NextResponse.json(
            { error: 'Failed to create holiday' },
            { status: 500 }
        );
    }
}
