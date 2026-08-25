import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/bookings/[id]
const getHandler = async (
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

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
    const { status, paymentStatus, paymentMethod, amount, depositPaid, date, timeSlot, customerName, customerPhone } = body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: 'Réservation non trouvée.' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (amount !== undefined) updateData.amount = amount;
    if (depositPaid !== undefined) updateData.depositPaid = depositPaid;
    if (date !== undefined) updateData.date = date;
    if (timeSlot !== undefined) updateData.timeSlot = timeSlot;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerPhone !== undefined) {
      updateData.customerPhone = customerPhone;
      // Upsert user with new phone
      await prisma.user.upsert({
        where: { phone: customerPhone },
        update: { name: customerName || booking.customerName },
        create: { name: customerName || booking.customerName, phone: customerPhone },
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    });

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

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: 'Réservation non trouvée.' }, { status: 404 });
    }

    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ message: 'Réservation supprimée.' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
