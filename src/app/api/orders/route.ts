import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ orders: [] });

    const orders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      orders: orders.map(o => ({
        ...o,
        items: JSON.parse(o.items as string),
        shippingAddress: JSON.parse(o.shippingAddress as string),
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingAddress, userId, total, subtotal, shippingCost, discountAmount, promoCode, paymentProvider } = body;

    const orderNumber = `RSH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        items: JSON.stringify(items),
        shippingAddress: JSON.stringify(shippingAddress),
        status: 'pending',
        total,
        subtotal,
        shippingCost: shippingCost || 0,
        discountAmount: discountAmount || 0,
        promoCode: promoCode || null,
        paymentProvider: paymentProvider || null,
        paymentStatus: 'pending',
      },
    });

    // Update promo code usage
    if (promoCode) {
      await db.promoCode.updateMany({
        where: { code: promoCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Update product stock & order count
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, orderCount: { increment: item.quantity } },
      });
    }

    // Clear cart
    if (userId) {
      await db.cartItem.deleteMany({ where: { userId } as never });
    }

    return NextResponse.json({ order: { ...order, items, shippingAddress }, orderNumber });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}