import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/users/[id]
const getHandler = async (
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { bookings: true, subscriptions: true } },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    return NextResponse.json(user);
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
    if (phone) {
      const existing = await prisma.user.findFirst({
        where: { phone, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Un utilisateur avec ce numéro existe déjà.' },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (notifications !== undefined) updateData.notifications = notifications;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(user);
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

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'Utilisateur supprimé.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
