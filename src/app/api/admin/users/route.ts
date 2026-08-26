import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// Derive user list from bookings + user profiles
interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  notifications: boolean;
  createdAt: string;
  _count: { bookings: number; subscriptions: number };
}

async function getAllUsers(): Promise<AdminUser[]> {
  const bookings = await db.booking.findMany({ orderBy: { createdAt: 'desc' } });
  const userMap = new Map<string, { name: string; phone: string; bookingCount: number; firstCreated: string }>();

  for (const b of bookings) {
    const existing = userMap.get(b.customerPhone);
    if (existing) {
      existing.bookingCount++;
      if (b.createdAt < existing.firstCreated) existing.firstCreated = b.createdAt;
    } else {
      userMap.set(b.customerPhone, {
        name: b.customerName,
        phone: b.customerPhone,
        bookingCount: 1,
        firstCreated: b.createdAt,
      });
    }
  }

  const users: AdminUser[] = [];
  for (const [phone, info] of userMap) {
    const profile = await db.user.find(phone);
    users.push({
      id: phone,
      name: profile?.name || info.name,
      phone,
      email: profile?.email || null,
      role: 'user',
      notifications: profile?.notifications ?? true,
      createdAt: info.firstCreated,
      _count: { bookings: info.bookingCount, subscriptions: 0 },
    });
  }
  return users;
}

// GET /api/admin/users?search=&page=&limit=
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    let users = await getAllUsers();

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }

    const total = users.length;
    const skip = (page - 1) * limit;
    const data = users.slice(skip, skip + limit);

    return NextResponse.json({
      data,
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
    const existing = await db.user.find(phone);
    if (existing) {
      return NextResponse.json(
        { error: 'Un utilisateur avec ce numéro de téléphone existe déjà.' },
        { status: 409 }
      );
    }

    const user = await db.user.upsert({
      phone,
      name,
      email: email || '',
      notifications: notifications !== false,
    });

    return NextResponse.json({
      id: user.phone,
      ...user,
      role: role || 'user',
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
