import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// GET /api/dashboard (protected)
const getHandler = async () => {
  try {
    const stats = await db.booking.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
