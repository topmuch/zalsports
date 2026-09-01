import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/user/create-admin — create admin account from user panel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Le nom d'utilisateur et le mot de passe sont requis." },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Le nom d'utilisateur doit faire au moins 3 caractères." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit faire au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const account = await db.admin.create({
      username,
      password,
      role: role || 'admin',
    });

    if (!account) {
      return NextResponse.json(
        { error: "Ce nom d'utilisateur est déjà utilisé." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, username: account.username, role: account.role }, { status: 201 });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
