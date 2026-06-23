import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse } from '@/lib/auth-api';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const totalProducts = await db.product.count();
    const totalOrders = await db.order.count();
    const totalUsers = await db.user.count({ where: { role: 'customer' } });
    const completedOrders = await db.order.findMany({
      where: { paymentStatus: 'completed' },
      select: { total: true },
    });
    const totalRevenue = completedOrders.reduce((s, o) => s + o.total, 0);
    const pendingOrders = await db.order.count({ where: { status: 'pending' } });
    const lowStock = await db.product.count({ where: { stock: { lte: 5, gt: 0 } } });
    const outOfStock = await db.product.count({ where: { stock: 0 } });

    return NextResponse.json({
      totalProducts, totalOrders, totalUsers, totalRevenue,
      pendingOrders, lowStock, outOfStock,
      recentOrders: await db.order.findMany({
        orderBy: { createdAt: 'desc' }, take: 5,
      }),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
