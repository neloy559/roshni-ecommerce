import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await db.product.findFirst({
      where: { slug, status: 'active' },
      include: { category: true, variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } });

    const related = await db.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, status: 'active' },
      take: 4,
      include: { category: true, variants: true },
      orderBy: { orderCount: 'desc' },
    });

    const formatProduct = (p: typeof product) => ({
      ...p,
      images: JSON.parse(p.images as string),
      tags: JSON.parse(p.tags as string),
      effectivePrice: p.discountPrice || p.price,
      hasDiscount: p.discountPrice !== null,
      discountPercent: p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0,
    });

    return NextResponse.json({ product: formatProduct(product), related: related.map(formatProduct) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}