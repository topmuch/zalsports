import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/settings — returns all settings as a key-value object
const getHandler = async () => {
  try {
    const settings = await prisma.siteSettings.findMany();
    const kv: Record<string, string> = {};
    for (const s of settings) {
      kv[s.key] = s.value;
    }
    return NextResponse.json(kv);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// PUT /api/admin/settings — batch update settings
// Body: { site_name: '...', site_phone: '...', ... }
const putHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Un objet clé-valeur est requis.' },
        { status: 400 }
      );
    }

    const entries = Object.entries(body) as [string, string][];

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.siteSettings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    // Return updated settings
    const settings = await prisma.siteSettings.findMany();
    const kv: Record<string, string> = {};
    for (const s of settings) {
      kv[s.key] = s.value;
    }
    return NextResponse.json(kv);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
