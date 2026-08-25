import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/users?search=&page=&limit=
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { bookings: true, subscriptions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/users
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, phone, email, role, notifications } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Le nom et le téléphone sont requis.' },
        { status: 400 }
      );
    }

    // Check for duplicate phone
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json(
        { error: 'Un utilisateur avec ce numéro de téléphone existe déjà.' },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email: email || null,
        role: role || 'user',
        notifications: notifications !== false,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
