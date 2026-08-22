import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/dashboard
export async function GET() {
  try {
    const stats = await db.booking.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
