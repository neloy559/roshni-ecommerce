import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

    const promo = await db.promoCode.findFirst({ where: { code: code.toUpperCase(), isActive: true } });

    if (!promo) return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });
    if (promo.expiresAt && promo.expiresAt < new Date()) return NextResponse.json({ error: 'Promo code expired' }, { status: 400 });
    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
    if (promo.minOrder > subtotal) return NextResponse.json({ error: `Minimum order ৳${promo.minOrder} required` }, { status: 400 });

    let discount = 0;
    if (promo.type === 'percentage') {
      discount = Math.round(subtotal * (promo.discount / 100));
    } else {
      discount = promo.discount;
    }

    return NextResponse.json({ valid: true, discount, code: promo.code, type: promo.type, value: promo.discount });
  } catch {
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}