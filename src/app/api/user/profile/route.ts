import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/profile?phone=...  —  Fetch user profile by phone number
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

    // Basic phone format validation (Senegalese or international)
    const cleanPhone = phone.trim();
    if (!/^\+?221\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Format de numéro invalide.' },
        { status: 400 }
      );
    }

    const profile = await db.user.find(cleanPhone);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil introuvable.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile  —  Create or update user profile
 * Body: { phone, name, email, notifications? }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, email, notifications } = body;

    if (!phone || !name) {
      return NextResponse.json(
        { error: 'Le téléphone et le nom sont requis.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    // Phone format validation
    if (!/^\+?221\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Format de numéro invalide.' },
        { status: 400 }
      );
    }

    // Email validation (optional but must be valid if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    const profile = await db.user.upsert({
      phone: cleanPhone,
      name: name.trim(),
      email: email?.trim() || '',
      notifications: typeof notifications === 'boolean' ? notifications : true,
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
