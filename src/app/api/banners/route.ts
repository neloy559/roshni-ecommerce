import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}