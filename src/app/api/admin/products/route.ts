import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse } from '@/lib/auth-api';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const products = await db.product.findMany({
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products.map(p => ({
      ...p,
      images: JSON.parse(p.images as string),
      tags: JSON.parse(p.tags as string),
    })));
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const { name, slug, description, price, discountPrice, stock, images, categoryId, tags, status, isTrending, isNewArrival, variants } = body;
    const product = await db.product.create({
      data: {
        name, slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description, price: parseFloat(price), discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock), images: JSON.stringify(images || []), categoryId, status: status || 'active',
        tags: JSON.stringify(tags || []), isTrending: isTrending || false, isNewArrival: isNewArrival || false,
        variants: variants ? { create: variants } : undefined,
      },
    });
    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const { id, name, slug, description, price, discountPrice, stock, images, categoryId, tags, status, isTrending, isNewArrival } = body;
    await db.product.update({
      where: { id },
      data: {
        name, slug, description, price: parseFloat(price), discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock), images: JSON.stringify(images), categoryId, status,
        tags: JSON.stringify(tags), isTrending, isNewArrival,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    await db.product.delete({ where: { id: searchParams.get('id')! } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
