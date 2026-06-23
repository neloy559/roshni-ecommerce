import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-api';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    const where: Record<string, unknown> = {};
    if (auth) where.userId = auth.userId;
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
    const auth = await getAuthUser(req);
    const body = await req.json();
    const { productId, variantId, quantity, sessionId } = body;

    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    // Check stock
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (product.stock < (quantity || 1)) {
      return NextResponse.json({
        error: `Only ${product.stock} in stock`,
      }, { status: 400 });
    }

    const where: Record<string, unknown> = { productId, variantId: variantId || null };
    if (auth) where.userId = auth.userId;
    else if (sessionId) where.sessionId = sessionId;

    const existing = await db.cartItem.findFirst({ where: where as never });

    if (existing) {
      const newQty = existing.quantity + (quantity || 1);
      if (newQty > product.stock) {
        return NextResponse.json({
          error: `Only ${product.stock} in stock. You already have ${existing.quantity} in your bag.`,
        }, { status: 400 });
      }
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await db.cartItem.create({
        data: {
          productId,
          variantId: variantId || null,
          quantity: quantity || 1,
          userId: auth?.userId || null,
          sessionId: auth ? null : (sessionId || null),
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
    const auth = await getAuthUser(req);
    const body = await req.json();
    const { itemId, quantity } = body;

    const where: Record<string, unknown> = { id: itemId };
    if (auth) where.userId = auth.userId;

    const item = await db.cartItem.findFirst({ where: where as never, include: { product: true } });
    if (!item) return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });

    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id: itemId } });
    } else {
      if (quantity > item.product.stock) {
        return NextResponse.json({
          error: `Only ${item.product.stock} in stock`,
        }, { status: 400 });
      }
      await db.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('id');
    const sessionId = searchParams.get('sessionId');

    if (itemId) {
      const where: Record<string, unknown> = { id: itemId };
      if (auth) where.userId = auth.userId;
      await db.cartItem.deleteMany({ where: where as never });
    } else {
      const where: Record<string, unknown> = {};
      if (auth) where.userId = auth.userId;
      else if (sessionId) where.sessionId = sessionId;
      if (Object.keys(where).length > 0) await db.cartItem.deleteMany({ where: where as never });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete cart item' }, { status: 500 });
  }
}
