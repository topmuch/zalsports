import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/bookings — Create a booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, timeSlot, customerName, customerPhone } = body;

    if (!date || !timeSlot || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    // Check date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    if (bookingDate < today) {
      return NextResponse.json(
        { error: 'La date doit être dans le futur.' },
        { status: 400 }
      );
    }

    // Check if slot is already booked (confirmed or pending)
    const existing = await db.booking.findFirst({
      where: { date, timeSlot, status: 'confirmed' },
    });
    const existingPending = await db.booking.findFirst({
      where: { date, timeSlot, status: 'pending' },
    });

    if (existing || existingPending) {
      return NextResponse.json(
        { error: 'Ce créneau est déjà réservé.' },
        { status: 409 }
      );
    }

    const booking = await db.booking.create({
      date,
      timeSlot,
      customerName,
      customerPhone,
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}

// GET /api/bookings?date=yyyy-MM-dd — Get available slots for a date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Le paramètre date est requis.' },
        { status: 400 }
      );
    }

    // Generate all possible slots
    const allSlots: string[] = [];
    for (let h = 8; h <= 23; h++) {
      allSlots.push(`${h.toString().padStart(2, '0')}:00`);
    }

    // Find booked slots (confirmed and pending both block the slot)
    const confirmedBookings = await db.booking.findMany({
      where: { date, status: 'confirmed' },
    });
    const pendingBookings = await db.booking.findMany({
      where: { date, status: 'pending' },
    });

    const bookedSlots = new Set([
      ...confirmedBookings.map((b) => b.timeSlot),
      ...pendingBookings.map((b) => b.timeSlot),
    ]);

    // Check if there's a custom slot config for this date
    let configHours: string[] | null = null;
    try {
      configHours = await db.slots.getConfig(date);
    } catch { /* ignore */ }

    const available = allSlots.map((slot) => {
      // If custom config exists, only listed hours are available
      if (configHours !== null && !configHours.includes(slot)) {
        return { time: slot, available: false };
      }
      return {
        time: slot,
        available: !bookedSlots.has(slot),
      };
    });

    return NextResponse.json({ date, available });
  } catch (error) {
    console.error('Slots fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
