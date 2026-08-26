import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';

// PATCH /api/admin/plans/[id] — not supported in-memory
const patchHandler = async (
  _request: NextRequest,
  _context?: { params: Promise<{ id: string }> }
) => {
  return NextResponse.json(
    { error: 'Les plans d\'abonnement ne sont pas supportés en mode mémoire.' },
    { status: 501 }
  );
};

// DELETE /api/admin/plans/[id] — not supported in-memory
const deleteHandler = async (
  _request: NextRequest,
  _context?: { params: Promise<{ id: string }> }
) => {
  return NextResponse.json(
    { error: 'Les plans d\'abonnement ne sont pas supportés en mode mémoire.' },
    { status: 501 }
  );
};

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
