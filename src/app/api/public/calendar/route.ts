import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/public/calendar?month=6&year=2025 — Public calendar data (no auth)
// Same data source as the admin calendar tab
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1 + '', 10);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear() + '', 10);

    const data = await db.booking.getCalendarMonth(year, month);

    return NextResponse.json({ year, month, data });
  } catch (error) {
    console.error('Public calendar error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
