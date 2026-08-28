import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bookings/month-availability?month=yyyy-MM
// Returns dates that are fully booked for a given month
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json(
        { error: 'Le paramètre month est requis (format: yyyy-MM).' },
        { status: 400 }
      );
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'Format invalide.' },
        { status: 400 }
      );
    }

    // Get all confirmed/pending bookings for this month
    const allBookings = await db.booking.findMany({});

    // Filter bookings for this month
    const monthBookings = allBookings.filter((b: { date: string; status: string }) => {
      if (b.status === 'cancelled') return false;
      const bDate = new Date(b.date);
      return bDate.getFullYear() === year && (bDate.getMonth() + 1) === monthNum;
    });

    // Count bookings per date
    const bookingsPerDate = new Map<string, number>();
    for (const b of monthBookings) {
      bookingsPerDate.set(b.date, (bookingsPerDate.get(b.date) || 0) + 1);
    }

    // 16 slots per day (08:00 to 23:00)
    const TOTAL_SLOTS = 16;
    const fullyBooked: string[] = [];

    for (const [date, count] of bookingsPerDate) {
      if (count >= TOTAL_SLOTS) {
        fullyBooked.push(date);
      }
    }

    return NextResponse.json({ fullyBooked });
  } catch (error) {
    console.error('Month availability error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
