import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const banners = await db.banner.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(banners);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, linkTarget, title, subtitle, order, isActive } = body;
    const banner = await db.banner.create({
      data: { image, linkTarget: linkTarget || '', title: title || '', subtitle: subtitle || '', order: order || 0, isActive: isActive !== false },
    });
    return NextResponse.json({ success: true, banner });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, image, linkTarget, title, subtitle, order, isActive } = body;
    await db.banner.update({
      where: { id },
      data: { image, linkTarget, title, subtitle, order, isActive },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    await db.banner.delete({ where: { id: searchParams.get('id')! } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}