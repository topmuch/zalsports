import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// GET /api/dashboard (protected)
// Uses in-memory store for bookings + Prisma for users/subscriptions/plans
const getHandler = async () => {
  try {
    // In-memory store stats (bookings)
    const memStats = await db.booking.getStats();

    // Prisma-enhanced stats
    let totalUsers = 0;
    let activeSubscriptions = 0;
    let totalSubscriptionRevenue = 0;

    try {
      const [userCount, subCount, subRevenue] = await Promise.all([
        prisma.user.count(),
        prisma.subscription.count({ where: { status: 'active' } }),
        prisma.subscription.aggregate({
          where: { status: { in: ['active', 'expired'] } },
          _sum: {},
        }),
      ]);
      totalUsers = userCount;
      activeSubscriptions = subCount;

      // Get total subscription revenue by summing plan prices
      const subs = await prisma.subscription.findMany({
        where: { status: { in: ['active', 'expired'] } },
        include: { plan: { select: { price: true } } },
      });
      totalSubscriptionRevenue = subs.reduce((sum, s) => sum + s.plan.price, 0);
    } catch {
      // Prisma tables may not be seeded yet — use defaults
    }

    return NextResponse.json({
      ...memStats,
      totalUsers,
      activeSubscriptions,
      totalSubscriptionRevenue,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
