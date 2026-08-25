import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/payments
const getHandler = async () => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(methods);
  } catch (error) {
    console.error('List payment methods error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/payments — create or update a payment method
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, name, label, active, logoUrl, phone } = body;

    if (!name || !label) {
      return NextResponse.json(
        { error: 'Le nom et le libellé sont requis.' },
        { status: 400 }
      );
    }

    // If id is provided, update; otherwise create
    if (id) {
      const existing = await prisma.paymentMethod.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: 'Méthode de paiement non trouvée.' }, { status: 404 });
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (name !== undefined) updateData.name = name;
      if (label !== undefined) updateData.label = label;
      if (active !== undefined) updateData.active = active;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
      if (phone !== undefined) updateData.phone = phone;

      const updated = await prisma.paymentMethod.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json(updated);
    }

    const method = await prisma.paymentMethod.create({
      data: {
        name,
        label,
        active: active !== false,
        logoUrl: logoUrl || null,
        phone: phone || null,
      },
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    console.error('Create/update payment method error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
