import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-api';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ orders: [] });

    const orders = await db.order.findMany({
      where: { userId: auth.userId },
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
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { items, shippingAddress, total, subtotal, shippingCost, discountAmount, promoCode, paymentProvider } = body;

    const orderNumber = `RSH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;

    // Validate stock before creating order
    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
        }, { status: 400 });
      }
    }

    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: auth.userId,
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

      if (promoCode) {
        await tx.promoCode.updateMany({
          where: { code: promoCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity }, orderCount: { increment: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: auth.userId } });

      return newOrder;
    });

    return NextResponse.json({ order: { ...order, items, shippingAddress }, orderNumber });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
