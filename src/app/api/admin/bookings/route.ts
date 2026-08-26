import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/bookings?status=&dateFrom=&dateTo=&search=
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const search = searchParams.get('search') || '';

    const args: Parameters<typeof db.booking.findMany>[0] = {
      orderBy: { createdAt: 'desc' },
    };

    const where: { date?: string; status?: string; paymentStatus?: string; customerPhone?: string; customerName?: string } = {};

    // Handle date range filter
    if (dateFrom) where.date = dateFrom; // simplified: use dateGte
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    let bookings = await db.booking.findMany(args);

    // Apply filters
    if (dateFrom) bookings = bookings.filter(b => b.date >= dateFrom);
    if (dateTo) bookings = bookings.filter(b => b.date <= dateTo);
    if (status) bookings = bookings.filter(b => b.status === status);
    if (paymentStatus) bookings = bookings.filter(b => b.paymentStatus === paymentStatus);
    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(b =>
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q)
      );
    }

    return NextResponse.json({ data: bookings });
  } catch (error) {
    console.error('List bookings error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/bookings
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { date, timeSlot, customerName, customerPhone, status, paymentStatus, paymentMethod, amount, depositPaid } = body;

    if (!date || !timeSlot || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'La date, le créneau, le nom et le téléphone sont requis.' },
        { status: 400 }
      );
    }

    const booking = await db.booking.create({
      date,
      timeSlot,
      customerName,
      customerPhone,
      status: status || 'confirmed',
    });

    // Update payment info if provided
    if (paymentStatus || paymentMethod || depositPaid !== undefined) {
      await db.booking.update(
        { id: booking.id },
        { paymentStatus, paymentMethod, depositPaid }
      );
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
