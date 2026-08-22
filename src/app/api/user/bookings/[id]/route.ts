import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * DELETE /api/user/bookings/[id]?phone=...
 *
 * Cancels a booking, but only if the phone matches the booking owner.
 * Returns 403 if the phone does not match (not your booking).
 * Returns 404 if booking not found.
 * Returns 409 if booking is already cancelled or completed.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const phone = new URL(request.url).searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Le paramètre phone est requis.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    if (!/^\+?221\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Format de numéro invalide.' },
        { status: 400 }
      );
    }

    // Fetch the booking first
    const booking = await db.booking.findUnique({ id });
    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable.' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (booking.customerPhone !== cleanPhone) {
      return NextResponse.json(
        { error: 'Vous ne pouvez annuler que vos propres réservations.' },
        { status: 403 }
      );
    }

    // Check if already cancelled or completed
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cette réservation est déjà annulée.' },
        { status: 409 }
      );
    }

    if (booking.status === 'completed') {
      return NextResponse.json(
        { error: 'Impossible d\'annuler une réservation terminée.' },
        { status: 409 }
      );
    }

    // Check if the booking date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(booking.date);
    if (bookingDate < today) {
      return NextResponse.json(
        { error: 'Impossible d\'annuler une réservation passée.' },
        { status: 409 }
      );
    }

    const updated = await db.booking.update({ id }, { status: 'cancelled' });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('User booking cancel error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
