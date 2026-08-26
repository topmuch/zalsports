import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ valid: false });
  }

  const token = authHeader.slice(7);
  const valid = verifyAdminToken(token);

  return NextResponse.json({ valid });
}
