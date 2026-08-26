import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// GET /api/dashboard (protected)
const getHandler = async () => {
  try {
    const memStats = await db.booking.getStats();

    // Derive user count from unique phones in bookings
    const allBookings = await db.booking.findMany();
    const uniquePhones = new Set(allBookings.map(b => b.customerPhone));

    return NextResponse.json({
      ...memStats,
      totalUsers: uniquePhones.size,
      activeSubscriptions: 0,
      totalSubscriptionRevenue: 0,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
