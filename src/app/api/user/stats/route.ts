import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/stats?phone=...
 *
 * Returns personal booking statistics for a user:
 *  - Total bookings
 *  - Breakdown by status (confirmed, completed, cancelled, pending)
 *  - Upcoming (future confirmed) count
 *  - Total amount spent (paid + partial deposits)
 *  - Last booking date
 *  - Favorite time slot
 */
export async function GET(request: NextRequest) {
  try {
    const phone = new URL(request.url).searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Le paramètre phone est requis.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    if (!/^\+?221\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Format de numéro invalide.' },
        { status: 400 }
      );
    }

    const allBookings = await db.booking.findMany({
      where: { customerPhone: cleanPhone },
      orderBy: { createdAt: 'desc' },
    });

    const today = new Date().toISOString().split('T')[0];

    const confirmed = allBookings.filter((b) => b.status === 'confirmed');
    const completed = allBookings.filter((b) => b.status === 'completed');
    const cancelled = allBookings.filter((b) => b.status === 'cancelled');
    const pending = allBookings.filter((b) => b.status === 'pending');
    const upcoming = confirmed.filter((b) => b.date >= today);

    // Total spent = deposit paid on all non-cancelled bookings
    const totalDeposits = allBookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.depositPaid, 0);

    // Favorite time slot
    const slotCounts: Record<string, number> = {};
    for (const b of allBookings) {
      if (b.status !== 'cancelled') {
        slotCounts[b.timeSlot] = (slotCounts[b.timeSlot] || 0) + 1;
      }
    }
    const favoriteSlot =
      Object.entries(slotCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Last booking date
    const lastBooking = allBookings[0] || null;

    // Monthly trend (last 6 months)
    const now = new Date();
    const monthlyTrend: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('fr-FR', {
        month: 'short',
        year: '2-digit',
      });
      const count = allBookings.filter(
        (b) => b.date.startsWith(monthStr) && b.status !== 'cancelled'
      ).length;
      monthlyTrend.push({ month: monthLabel, count });
    }

    return NextResponse.json({
      phone: cleanPhone,
      totalBookings: allBookings.length,
      byStatus: {
        confirmed: confirmed.length,
        completed: completed.length,
        cancelled: cancelled.length,
        pending: pending.length,
      },
      upcomingCount: upcoming.length,
      upcomingBookings: upcoming.slice(0, 5),
      totalDepositsPaid: totalDeposits,
      favoriteSlot,
      lastBookingDate: lastBooking?.date || null,
      lastBookingSlot: lastBooking?.timeSlot || null,
      monthlyTrend,
    });
  } catch (error) {
    console.error('User stats fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
