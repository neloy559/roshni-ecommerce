import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { parentId: null },
      include: { 
        products: { where: { status: 'active' }, select: { id: true } },
      },
      orderBy: { order: 'asc' },
    });

    const withChildren = await Promise.all(categories.map(async (cat) => {
      const children = await db.category.findMany({
        where: { parentId: cat.id },
        include: { products: { where: { status: 'active' }, select: { id: true } } },
        orderBy: { order: 'asc' },
      });
      return {
        ...cat,
        productCount: cat.products.length + children.reduce((sum, c) => sum + c.products.length, 0),
        children: children.map(c => ({ ...c, productCount: c.products.length })),
      };
    }));

    return NextResponse.json(withChildren);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}