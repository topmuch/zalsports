import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/bookings/calendar?month=&year=
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1 + '', 10);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear() + '', 10);

    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    const startDate = `${monthStr}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${monthStr}-${lastDay.toString().padStart(2, '0')}`;

    const data = await db.booking.getCalendarMonth(year, month);

    return NextResponse.json({
      year,
      month,
      startDate,
      endDate,
      data,
    });
  } catch (error) {
    console.error('Calendar error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
