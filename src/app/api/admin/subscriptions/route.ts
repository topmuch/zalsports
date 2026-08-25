import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/subscriptions
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
          plan: true,
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return NextResponse.json({
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List subscriptions error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/subscriptions
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, planId, startDate, endDate, status } = body;

    if (!userId || !planId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'L\'utilisateur, le plan, la date de début et de fin sont requis.' },
        { status: 400 }
      );
    }

    // Verify user and plan exist
    const [user, plan] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.subscriptionPlan.findUnique({ where: { id: planId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }
    if (!plan) {
      return NextResponse.json({ error: 'Plan non trouvé.' }, { status: 404 });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        startDate,
        endDate,
        status: status || 'active',
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        plan: true,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
