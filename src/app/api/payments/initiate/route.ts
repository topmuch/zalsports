import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// POST /api/payments/initiate — PUBLIC (no auth)
// Takes: { bookingId, method: 'wave' | 'orange_money', phone, amount }
// Returns: { paymentUrl, reference }
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { bookingId, method, phone, amount } = body;

    if (!bookingId || !method || !phone || !amount) {
      return NextResponse.json(
        { error: 'bookingId, method, phone et amount sont requis.' },
        { status: 400 }
      );
    }

    if (!['wave', 'orange_money'].includes(method)) {
      return NextResponse.json(
        { error: 'Méthode de paiement invalide. Utilisez wave ou orange_money.' },
        { status: 400 }
      );
    }

    // Generate a unique payment reference
    const reference = `ZAL-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;

    // Generate mock payment URL
    // In production, this would call the actual payment provider API
    const paymentUrl = `https://pay.zalsports.sn/checkout?ref=${reference}&method=${method}&amount=${amount}&phone=${encodeURIComponent(phone)}`;

    // Update the booking with payment method if it exists in DB
    // We do this asynchronously and don't block the response
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentMethod: method },
      });
    } catch {
      // Booking may be in in-memory store only — that's fine
    }

    return NextResponse.json({
      paymentUrl,
      reference,
      status: 'pending',
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const POST = postHandler;
