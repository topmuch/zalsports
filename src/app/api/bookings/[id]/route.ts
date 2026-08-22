import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/bookings/[id] — Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide.' },
        { status: 400 }
      );
    }

    const booking = await db.booking.update({ id }, { status });
    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// DELETE /api/bookings/[id] — Cancel booking
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await db.booking.update({ id }, { status: 'cancelled' });
    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Booking cancel error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
