import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/bookings?phone=...&status=...&date=...&from=...&to=...&limit=...
 *
 * Query params:
 *   phone  (required)  — customer phone number
 *   status (optional)  — filter by status: confirmed, completed, cancelled, pending
 *   date   (optional)  — filter by exact date (yyyy-MM-dd)
 *   from   (optional)  — start date for range filter
 *   to     (optional)  — end date for range filter
 *   limit  (optional)  — max results (default 20, max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limitParam = searchParams.get('limit');

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

    // Validate status if provided
    const validStatuses = ['confirmed', 'completed', 'cancelled', 'pending'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées : ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Record<string, string> = { customerPhone: cleanPhone };
    if (status) where.status = status;
    if (date) where.date = date;
    if (from) where.dateGte = from;
    if (to) where.dateLte = to;

    // Parse and clamp limit
    let limit = 20;
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 50);
      }
    }

    const bookings = await db.booking.findMany({
      where,
      orderBy: { date: 'asc' },
      take: limit,
    });

    return NextResponse.json({
      phone: cleanPhone,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('User bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
