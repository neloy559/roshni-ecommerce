import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: { products: { select: { id: true } } },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(categories.map(c => ({ ...c, productCount: c.products.length })));
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, image, parentId, order } = body;
    const cat = await db.category.create({
      data: { name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), image: image || '', parentId: parentId || null, order: order || 0 },
    });
    return NextResponse.json({ success: true, category: cat });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    await db.category.delete({ where: { id: searchParams.get('id')! } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}