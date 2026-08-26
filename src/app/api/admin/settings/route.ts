import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';

// In-memory settings store
const settingsStore = new Map<string, string>([
  ['site_name', 'ZalFoot'],
  ['site_phone', '+221 77 000 00 00'],
  ['site_email', 'contact@zalfoot.sn'],
  ['site_address', 'Dakar, Sénégal'],
  ['currency', 'FCFA'],
  ['slot_price', '25000'],
  ['opening_hour', '08:00'],
  ['closing_hour', '23:00'],
]);

// GET /api/admin/settings — returns all settings as a key-value object
const getHandler = async () => {
  try {
    const kv: Record<string, string> = {};
    for (const [key, value] of settingsStore) {
      kv[key] = value;
    }
    return NextResponse.json(kv);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// PUT /api/admin/settings — batch update settings
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
    for (const [key, value] of entries) {
      settingsStore.set(key, String(value));
    }

    // Return updated settings
    const kv: Record<string, string> = {};
    for (const [key, value] of settingsStore) {
      kv[key] = value;
    }
    return NextResponse.json(kv);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
