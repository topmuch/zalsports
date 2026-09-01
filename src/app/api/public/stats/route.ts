import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/public/stats — Public: homepage stats (no auth)
export async function GET() {
  try {
    const stats = await db.booking.getStats();
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = await db.booking.findMany({
      where: { date: today },
      orderBy: { timeSlot: 'asc' },
    });
    const todayActive = todayBookings.filter(b => b.status !== 'cancelled');

    return NextResponse.json({
      totalBookings: stats.totalBookings,
      todayBookings: stats.todayBookings,
      confirmedCount: stats.confirmedCount,
      completedCount: stats.completedCount,
      occupancyRate: stats.occupancyRate,
      // Today's slots for homepage
      todaySlotList: todayActive.slice(0, 6).map(b => ({
        timeSlot: b.timeSlot,
        customerName: b.customerName,
        status: b.status,
      })),
      // Upcoming count
      upcomingCount: stats.confirmedCount - todayActive.filter(b => b.status === 'confirmed').length,
    });
  } catch (error) {
    console.error('Public stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
