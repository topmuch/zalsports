import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// PATCH /api/admin/plans/[id]
const patchHandler = async (
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    const body = await request.json();
    const { name, description, price, duration, features, active } = body;

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan non trouvé.' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (duration !== undefined) updateData.duration = duration;
    if (features !== undefined) {
      updateData.features = typeof features === 'string' ? features : JSON.stringify(features);
    }
    if (active !== undefined) updateData.active = active;

    const updated = await prisma.subscriptionPlan.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { subscriptions: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// DELETE /api/admin/plans/[id]
const deleteHandler = async (
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan non trouvé.' }, { status: 404 });
    }

    await prisma.subscriptionPlan.delete({ where: { id } });
    return NextResponse.json({ message: 'Plan supprimé.' });
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
