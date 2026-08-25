import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/plans
const getHandler = async () => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('List plans error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/plans
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, price, duration, features, active } = body;

    if (!name || price === undefined || !duration) {
      return NextResponse.json(
        { error: 'Le nom, le prix et la durée sont requis.' },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description: description || null,
        price,
        duration,
        features: typeof features === 'string' ? features : JSON.stringify(features || []),
        active: active !== false,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
