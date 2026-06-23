import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    else if (sessionId) where.sessionId = sessionId;
    else return NextResponse.json({ items: [] });

    const items = await db.cartItem.findMany({
      where,
      include: { product: { include: { category: true, variants: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = items.map(item => {
      const images = JSON.parse(item.product.images as string);
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        name: item.product.name,
        slug: item.product.slug,
        image: images[0] || '',
        price: item.product.discountPrice || item.product.price,
        originalPrice: item.product.price,
        hasDiscount: item.product.discountPrice !== null,
        variant: item.variantId
          ? item.product.variants.find(v => v.id === item.variantId)
          : null,
        stock: item.product.stock,
      };
    });

    const subtotal = formatted.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = formatted.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({ items: formatted, subtotal, count });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, variantId, quantity, userId, sessionId } = body;

    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    const where: Record<string, unknown> = { productId, variantId: variantId || null };
    if (userId) where.userId = userId;
    else if (sessionId) where.sessionId = sessionId;

    const existing = await db.cartItem.findFirst({ where: where as never });

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (quantity || 1) },
      });
    } else {
      await db.cartItem.create({
        data: {
          productId,
          variantId: variantId || null,
          quantity: quantity || 1,
          userId: userId || null,
          sessionId: sessionId || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, quantity } = body;
    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id: itemId } });
    } else {
      await db.cartItem.update({ where: { id: itemId }, data: { quantity } });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (itemId) {
      await db.cartItem.delete({ where: { id: itemId } });
    } else {
      const where: Record<string, unknown> = {};
      if (userId) where.userId = userId;
      else if (sessionId) where.sessionId = sessionId;
      if (Object.keys(where).length > 0) await db.cartItem.deleteMany({ where: where as never });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete cart item' }, { status: 500 });
  }
}