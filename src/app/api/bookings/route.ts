import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bookings — List bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const customerPhone = searchParams.get('phone');
    const paymentStatus = searchParams.get('paymentStatus');
    const dateGte = searchParams.get('dateGte');
    const dateLte = searchParams.get('dateLte');
    const take = searchParams.get('take');

    const bookings = await db.booking.findMany({
      where: {
        date: date || undefined,
        status: status || undefined,
        customerPhone: customerPhone || undefined,
        paymentStatus: paymentStatus || undefined,
        dateGte: dateGte || undefined,
        dateLte: dateLte || undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: take ? parseInt(take) : undefined,
    });

    return NextResponse.json({ data: bookings });
  } catch (error) {
    console.error('List bookings error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// POST /api/bookings — Create booking
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

    // Check for existing booking at same date/time
    const existing = await db.booking.findFirst({
      date,
      timeSlot,
      status: 'confirmed',
    });

    if (existing) {
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

    return NextResponse.json({ id: booking.id, booking }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
