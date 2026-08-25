import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/slots?date=yyyy-MM-dd — Get available hours for a date
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Le paramètre date est requis.' }, { status: 400 });
    }

    const config = await db.slots.getConfig(date);
    // If null, all hours are available (8-23)
    const allHours: string[] = [];
    for (let h = 8; h <= 23; h++) {
      allHours.push(`${h.toString().padStart(2, '0')}:00`);
    }

    return NextResponse.json({
      date,
      availableHours: config || allHours,
      isCustom: config !== null,
    });
  } catch (error) {
    console.error('Get slots config error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/slots — Set available hours for a date
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { date, hours } = body;

    if (!date || !Array.isArray(hours)) {
      return NextResponse.json(
        { error: 'date (string) et hours (string[]) sont requis.' },
        { status: 400 }
      );
    }

    const result = await db.slots.setConfig(date, hours);

    return NextResponse.json({
      success: true,
      date,
      availableHours: result,
    });
  } catch (error) {
    console.error('Set slots config error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// PATCH /api/admin/slots — Toggle a single hour
const patchHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { date, hour } = body;

    if (!date || !hour) {
      return NextResponse.json(
        { error: 'date et hour sont requis.' },
        { status: 400 }
      );
    }

    const result = await db.slots.toggleHour(date, hour);

    const allHours: string[] = [];
    for (let h = 8; h <= 23; h++) {
      allHours.push(`${h.toString().padStart(2, '0')}:00`);
    }

    return NextResponse.json({
      success: true,
      date,
      availableHours: result || allHours,
      isCustom: result !== null,
    });
  } catch (error) {
    console.error('Toggle slot error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
export const PATCH = withAuth(patchHandler);
