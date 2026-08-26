import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/calendar?phone=...&year=...&month=...
 *
 * Returns a map of date -> bookings[] for the given month.
 * If no year/month provided, defaults to the current month.
 * If no phone provided, returns all bookings for the month (admin-style).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    // Validate phone if provided
    if (phone) {
      const cleanPhone = phone.trim();
      if (!/^\+?221\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(cleanPhone)) {
        return NextResponse.json(
          { error: 'Format de numéro invalide.' },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

    // Validate year and month
    if (isNaN(year) || year < 2020 || year > 2100) {
      return NextResponse.json(
        { error: 'Année invalide.' },
        { status: 400 }
      );
    }
    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Mois invalide (1-12).' },
        { status: 400 }
      );
    }

    const calendarData = await db.booking.getCalendarMonth(year, month, phone || undefined);

    // Convert map to a flat array for JSON serialization
    const days = Object.entries(calendarData).map(([date, bookings]) => ({
      date,
      bookingCount: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        timeSlot: b.timeSlot,
        status: b.status,
        paymentStatus: b.paymentStatus,
      })),
    }));

    return NextResponse.json({
      year,
      month,
      totalDays: days.length,
      totalBookings: days.reduce((sum, d) => sum + d.bookingCount, 0),
      days,
    });
  } catch (error) {
    console.error('User calendar fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
