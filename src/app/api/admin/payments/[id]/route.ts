import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// DELETE /api/admin/payments/[id]
const deleteHandler = async (
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;

    const method = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!method) {
      return NextResponse.json(
        { error: 'Méthode de paiement non trouvée.' },
        { status: 404 }
      );
    }

    await prisma.paymentMethod.delete({ where: { id } });
    return NextResponse.json({ message: 'Méthode de paiement supprimée.' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const DELETE = withAuth(deleteHandler);
