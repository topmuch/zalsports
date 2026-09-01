import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// PUT /api/admin/plans/[id] — update plan
const putHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, price, duration, features, active } = body;

    const plan = await db.plan.update(id, {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price: Number(price) }),
      ...(duration !== undefined && { duration }),
      ...(features !== undefined && { features }),
      ...(active !== undefined && { active }),
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Formule introuvable.' },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// DELETE /api/admin/plans/[id] — delete plan
const deleteHandler = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const existed = await db.plan.delete(id);

    if (!existed) {
      return NextResponse.json(
        { error: 'Formule introuvable.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
