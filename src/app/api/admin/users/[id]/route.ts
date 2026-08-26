import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/users/[id] — id is treated as phone number
const getHandler = async (
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    const profile = await db.user.find(id);
    const userBookings = await db.booking.findMany({
      where: { customerPhone: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Derive user info from bookings if no profile exists
    const firstBooking = userBookings[userBookings.length - 1];
    if (!profile && !firstBooking) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    const name = profile?.name || firstBooking?.customerName || '';
    const email = profile?.email || null;
    const notifications = profile?.notifications ?? true;
    const createdAt = firstBooking?.createdAt || new Date().toISOString();

    const totalBookings = await db.booking.count({ where: { customerPhone: id } });

    return NextResponse.json({
      id,
      name,
      phone: id,
      email,
      role: 'user',
      notifications,
      createdAt,
      updatedAt: createdAt,
      _count: { bookings: totalBookings, subscriptions: 0 },
      bookings: userBookings,
      subscriptions: [],
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// PATCH /api/admin/users/[id]
const patchHandler = async (
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    const body = await request.json();
    const { name, phone, email, role, notifications } = body;

    // If phone is being changed, check for uniqueness
    if (phone && phone !== id) {
      const existing = await db.user.find(phone);
      if (existing) {
        return NextResponse.json(
          { error: 'Un utilisateur avec ce numéro existe déjà.' },
          { status: 409 }
        );
      }
    }

    const currentProfile = await db.user.find(id);
    const updated = await db.user.upsert({
      phone: phone || id,
      name: name || currentProfile?.name || '',
      email: email !== undefined ? email : (currentProfile?.email || ''),
      notifications: notifications !== undefined ? notifications : (currentProfile?.notifications ?? true),
    });

    return NextResponse.json({
      id: updated.phone,
      ...updated,
      role: role || 'user',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// DELETE /api/admin/users/[id]
const deleteHandler = async (
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;

    // Check if user exists (via bookings or profile)
    const profile = await db.user.find(id);
    const bookingCount = await db.booking.count({ where: { customerPhone: id } });
    if (!profile && bookingCount === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    // Cancel all user's bookings instead of deleting
    const bookings = await db.booking.findMany({ where: { customerPhone: id } });
    await Promise.all(bookings.map((b) => db.booking.update({ id: b.id }, { status: 'cancelled' })));

    return NextResponse.json({ message: 'Utilisateur supprimé.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
