import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// PATCH /api/admin/subscriptions/[id]
const patchHandler = async (
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    const body = await request.json();
    const { status, startDate, endDate, planId } = body;

    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription) {
      return NextResponse.json(
        { error: 'Abonnement non trouvé.' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (planId !== undefined) updateData.planId = planId;

    const updated = await prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        plan: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// DELETE /api/admin/subscriptions/[id]
const deleteHandler = async (
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;

    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription) {
      return NextResponse.json(
        { error: 'Abonnement non trouvé.' },
        { status: 404 }
      );
    }

    await prisma.subscription.delete({ where: { id } });
    return NextResponse.json({ message: 'Abonnement supprimé.' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
