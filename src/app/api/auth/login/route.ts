import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, createAdminToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Identifiants manquants.' },
        { status: 400 }
      );
    }

    // Check default admin (env credentials)
    let valid = verifyAdmin(username, password);

    // Check DB admin accounts
    if (!valid) {
      valid = await db.admin.verifyCredentials(username, password);
    }

    if (!valid) {
      return NextResponse.json(
        { error: 'Identifiants incorrects.' },
        { status: 401 }
      );
    }

    const token = createAdminToken();
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
