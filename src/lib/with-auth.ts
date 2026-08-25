import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from './auth';

type HandlerFunction = (
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with admin token authentication.
 * Checks the Authorization: Bearer <token> header.
 */
export function withAuth(handler: HandlerFunction) {
  return async (
    request: NextRequest,
    context?: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentification requise.' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré.' },
        { status: 401 }
      );
    }

    return handler(request, context);
  };
}
