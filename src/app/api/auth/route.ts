import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcryptjs';
import { signToken, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('roshni-token')?.value;
    if (!token) return NextResponse.json({ user: null });

    const payload = await verifyToken(token);
    if (!payload) {
      const res = NextResponse.json({ user: null });
      res.cookies.set('roshni-token', '', { maxAge: 0, path: '/' });
      return res;
    }

    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      const res = NextResponse.json({ user: null });
      res.cookies.set('roshni-token', '', { maxAge: 0, path: '/' });
      return res;
    }

    return NextResponse.json({
      user: {
        id: user.id, name: user.name, email: user.email, phone: user.phone,
        role: user.role, addresses: JSON.parse(user.addresses as string || '[]'),
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'login') {
      const { email, password, phone } = body;
      if ((!email && !phone) || !password) {
        return NextResponse.json({ error: 'Email/phone and password required' }, { status: 400 });
      }

      const user = await db.user.findFirst({
        where: email ? { email } : { phone },
      });

      if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      if (!(await compare(password, user.passwordHash))) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = await signToken({ userId: user.id, role: user.role });
      const response = NextResponse.json({
        id: user.id, name: user.name, email: user.email, phone: user.phone,
        role: user.role, addresses: JSON.parse(user.addresses as string || '[]'),
      });
      response.cookies.set('roshni-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    if (action === 'register') {
      const { name, email, phone, password } = body;
      if (!name || !phone || !password) {
        return NextResponse.json({ error: 'Name, phone, and password required' }, { status: 400 });
      }

      const existing = await db.user.findFirst({
        where: { OR: [{ email: email || '' }, { phone }] },
      });
      if (existing) return NextResponse.json({ error: 'Email or phone already registered' }, { status: 409 });

      const passwordHash = await hash(password, 12);
      const user = await db.user.create({
        data: { name, email: email || `${phone}@placeholder.com`, phone, passwordHash, role: 'customer' },
      });

      const token = await signToken({ userId: user.id, role: user.role });
      const response = NextResponse.json({
        id: user.id, name: user.name, email: user.email, phone: user.phone,
        role: user.role, addresses: [],
      });
      response.cookies.set('roshni-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('roshni-token', '', { maxAge: 0, path: '/' });
      return response;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('roshni-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, email, phone, addresses } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (addresses) updateData.addresses = JSON.stringify(addresses);

    const user = await db.user.update({
      where: { id: payload.userId },
      data: updateData,
    });

    return NextResponse.json({
      id: user.id, name: user.name, email: user.email, phone: user.phone,
      role: user.role, addresses: JSON.parse(user.addresses as string || '[]'),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
