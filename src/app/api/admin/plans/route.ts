import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/plans — plans not supported in-memory, return empty
const getHandler = async () => {
  try {
    return NextResponse.json([]);
  } catch (error) {
    console.error('List plans error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/plans — not supported in-memory
const postHandler = async () => {
  return NextResponse.json(
    { error: 'Les plans d\'abonnement ne sont pas supportés en mode mémoire.' },
    { status: 501 }
  );
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
