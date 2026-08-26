import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/bookings/[id]
const getHandler = async (
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    const booking = await db.booking.findUnique({ id });

    if (!booking) {
      return NextResponse.json({ error: 'Réservation non trouvée.' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// PATCH /api/admin/bookings/[id]
const patchHandler = async (
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    const body = await request.json();
    const { status, paymentStatus, paymentMethod, depositPaid } = body;

    const updateData: { status?: string; paymentStatus?: string; paymentMethod?: string; depositPaid?: number } = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (depositPaid !== undefined) updateData.depositPaid = depositPaid;

    const updated = await db.booking.update({ id }, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Réservation non trouvée.' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// DELETE /api/admin/bookings/[id]
const deleteHandler = async (
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    const booking = await db.booking.update({ id }, { status: 'cancelled' });
    if (!booking) {
      return NextResponse.json({ error: 'Réservation non trouvée.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Réservation supprimée.' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
