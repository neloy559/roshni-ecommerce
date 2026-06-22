import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const onSale = searchParams.get('sale');
    const trending = searchParams.get('trending');
    const newArrivals = searchParams.get('new');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status: 'active' };

    if (category) {
      const cat = await db.category.findFirst({
        where: { slug: category },
        include: { products: false },
      });
      if (cat) {
        if (cat.parentId) {
          where.categoryId = cat.id;
        } else {
          const childIds = await db.category.findMany({ where: { parentId: cat.id }, select: { id: true } });
          where.categoryId = { in: [cat.id, ...childIds.map(c => c.id)] };
        }
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
    }

    if (onSale === 'true') {
      where.discountPrice = { not: null };
    }

    if (trending === 'true') {
      where.isTrending = true;
    }

    if (newArrivals === 'true') {
      where.isNewArrival = true;
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'popular') orderBy = { orderCount: 'desc' };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true, variants: true },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const formatted = products.map(p => ({
      ...p,
      images: JSON.parse(p.images as string),
      tags: JSON.parse(p.tags as string),
      effectivePrice: p.discountPrice || p.price,
      hasDiscount: p.discountPrice !== null,
      discountPercent: p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0,
    }));

    return NextResponse.json({ products: formatted, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}