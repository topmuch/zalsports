import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/bookings?status=&dateFrom=&dateTo=&search=&page=&limit=
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (dateFrom || dateTo) {
      where.date = {} as Record<string, string>;
      if (dateFrom) (where.date as Record<string, string>).gte = dateFrom;
      if (dateTo) (where.date as Record<string, string>).lte = dateTo;
    }
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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

    // Upsert the user by phone
    await prisma.user.upsert({
      where: { phone: customerPhone },
      update: { name: customerName },
      create: {
        name: customerName,
        phone: customerPhone,
      },
    });

    const booking = await prisma.booking.create({
      data: {
        date,
        timeSlot,
        customerName,
        customerPhone,
        status: status || 'confirmed',
        paymentStatus: paymentStatus || 'unpaid',
        paymentMethod: paymentMethod || null,
        amount: amount || 25000,
        depositPaid: depositPaid || 0,
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
