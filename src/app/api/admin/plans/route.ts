import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';

// GET /api/admin/plans — list all plans
const getHandler = async () => {
  try {
    const plans = await db.plan.findAll();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('List plans error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

// POST /api/admin/plans — create plan
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, price, duration, features } = body;

    if (!name || !price || !duration) {
      return NextResponse.json(
        { error: 'Le nom, le prix et la durée sont requis.' },
        { status: 400 }
      );
    }

    const plan = await db.plan.create({
      name,
      price: Number(price),
      duration,
      features: features || '',
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
