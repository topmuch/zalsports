import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/subscriptions — subscriptions not supported in-memory, return empty
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    return NextResponse.json({
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    });
  } catch (error) {
    console.error('List subscriptions error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/subscriptions — not supported in-memory
const postHandler = async () => {
  return NextResponse.json(
    { error: 'Les abonnements ne sont pas supportés en mode mémoire.' },
    { status: 501 }
  );
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
