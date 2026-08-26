import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bookings/upcoming — Public: all upcoming confirmed/pending bookings
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const bookings = await db.booking.findMany({
      where: { dateGte: today },
      orderBy: { date: 'asc' },
    });
    // Only show confirmed and pending (not cancelled)
    const upcoming = bookings.filter(b => b.status !== 'cancelled');
    return NextResponse.json({ bookings: upcoming });
  } catch (error) {
    console.error('Upcoming bookings error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
