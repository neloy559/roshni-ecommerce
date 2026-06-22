import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, phone: true, email: true } } },
    });
    return NextResponse.json(orders.map(o => ({ ...o, items: JSON.parse(o.items as string), shippingAddress: JSON.parse(o.shippingAddress as string) })));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();
    await db.order.update({ where: { id: orderId }, data: { status } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}