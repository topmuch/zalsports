import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// PATCH /api/bookings/[id] — Update booking status (protected)
const patchHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
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
};

// DELETE /api/bookings/[id] — Cancel booking (protected)
const deleteHandler = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
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
};

// GET remains public (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await db.booking.findUnique({ id });
    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable.' },
        { status: 404 }
      );
    }
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Booking fetch error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// POST remains public (no auth required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const booking = await db.booking.update({ id }, body);
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

// PATCH and DELETE are protected
export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
