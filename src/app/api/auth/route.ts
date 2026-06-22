import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'login') {
      const { email, password, phone } = body;
      const identifier = email || phone;
      if (!identifier || !password) return NextResponse.json({ error: 'Email/phone and password required' }, { status: 400 });

      const user = await db.user.findFirst({
        where: email ? { email } : { phone },
      });

      if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      if (!(await compare(password, user.passwordHash))) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: JSON.parse(user.addresses as string || '[]'),
      });
    }

    if (action === 'register') {
      const { name, email, phone, password } = body;
      if (!name || !phone || !password) return NextResponse.json({ error: 'Name, phone, and password required' }, { status: 400 });

      const existing = await db.user.findFirst({
        where: { OR: [{ email: email || '' }, { phone }] },
      });
      if (existing) return NextResponse.json({ error: 'Email or phone already registered' }, { status: 409 });

      const passwordHash = await hash(password, 12);
      const user = await db.user.create({
        data: { name, email: email || `${phone}@placeholder.com`, phone, passwordHash, role: 'customer' },
      });

      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: [],
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, email, phone, addresses } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (addresses) updateData.addresses = JSON.stringify(addresses);

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: JSON.parse(user.addresses as string || '[]'),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}