import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/admin-accounts — list admin accounts (without passwords)
const getHandler = async () => {
  try {
    const accounts = await db.admin.findAll();
    return NextResponse.json({ data: accounts });
  } catch (error) {
    console.error('List admin accounts error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/admin-accounts — create new admin account
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Le nom d'utilisateur et le mot de passe sont requis." },
        { status: 400 }
      );
    }

    if (!['admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { error: 'Role invalide.' },
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
        { error: "Ce nom d'utilisateur est deja utilise." },
        { status: 409 }
      );
    }

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Create admin account error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// DELETE /api/admin/admin-accounts?username=xxx
const deleteHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: "Le nom d'utilisateur est requis." },
        { status: 400 }
      );
    }

    // Prevent deleting the default admin
    const defaultAdmin = process.env.ADMIN_USERNAME || 'admin';
    if (username === defaultAdmin) {
      return NextResponse.json(
        { error: 'Impossible de supprimer le compte admin principal.' },
        { status: 403 }
      );
    }

    await db.admin.delete(username);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete admin account error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
export const DELETE = withAuth(deleteHandler);
