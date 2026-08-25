import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/bookings/calendar?month=&year=
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1 + '', 10);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear() + '', 10);

    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    const startDate = `${monthStr}-01`;
    // Get last day of month
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${monthStr}-${lastDay.toString().padStart(2, '0')}`;

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: { not: 'cancelled' },
      },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
    });

    // Group by date
    const byDate: Record<string, typeof bookings> = {};
    for (const b of bookings) {
      if (!byDate[b.date]) byDate[b.date] = [];
      byDate[b.date].push(b);
    }

    return NextResponse.json({
      year,
      month,
      startDate,
      endDate,
      data: byDate,
    });
  } catch (error) {
    console.error('Calendar error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
