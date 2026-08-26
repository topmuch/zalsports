import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';

// DELETE /api/admin/payments/[id] — in-memory, just return success
const deleteHandler = async (
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    // In-memory mode: no real persistence, just acknowledge
    return NextResponse.json({ message: 'Méthode de paiement supprimée.' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const DELETE = withAuth(deleteHandler);
