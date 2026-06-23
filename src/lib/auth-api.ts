import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('roshni-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}

export async function requireAdmin(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}

export function isAuthResponse(obj: unknown): obj is NextResponse {
  return obj instanceof NextResponse;
}
