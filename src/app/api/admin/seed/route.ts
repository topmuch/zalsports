import { NextResponse } from 'next/server';
import { seedDefaults } from '@/lib/seed';
import { withAuth } from '@/lib/with-auth';

// POST /api/admin/seed
const postHandler = async () => {
  try {
    const result = await seedDefaults();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'initialisation.' }, { status: 500 });
  }
};

export const POST = withAuth(postHandler);
