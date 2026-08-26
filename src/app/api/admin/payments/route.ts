import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';

// Default payment methods (in-memory, no Prisma paymentMethod model)
const defaultMethods = [
  { id: 'wave', name: 'wave', label: 'Wave', active: true, logoUrl: null, phone: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'orange-money', name: 'orange-money', label: 'Orange Money', active: true, logoUrl: null, phone: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'especes', name: 'especes', label: 'Espèces', active: true, logoUrl: null, phone: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// In-memory store for payment method overrides
const methodOverrides = new Map<string, typeof defaultMethods[0]>();

// GET /api/admin/payments
const getHandler = async () => {
  try {
    const methods = defaultMethods.map((m) => methodOverrides.get(m.id) || m);
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

    const now = new Date().toISOString();

    if (id) {
      const existing = defaultMethods.find((m) => m.id === id) || methodOverrides.get(id);
      if (!existing) {
        return NextResponse.json({ error: 'Méthode de paiement non trouvée.' }, { status: 404 });
      }

      const updated = { ...existing, name, label, active: active !== false, logoUrl: logoUrl ?? existing.logoUrl, phone: phone ?? existing.phone, updatedAt: now };
      methodOverrides.set(id, updated);
      return NextResponse.json(updated);
    }

    const newMethod = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      label,
      active: active !== false,
      logoUrl: logoUrl || null,
      phone: phone || null,
      createdAt: now,
      updatedAt: now,
    };

    methodOverrides.set(newMethod.id, newMethod);
    return NextResponse.json(newMethod, { status: 201 });
  } catch (error) {
    console.error('Create/update payment method error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
