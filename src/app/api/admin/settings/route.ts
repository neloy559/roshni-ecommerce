import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const settings = await db.storeSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await db.storeSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}