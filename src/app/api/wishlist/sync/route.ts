import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { StockSyncResult } from '@/types';

/**
 * GET /api/wishlist/sync
 *
 * Returns fresh stock status ONLY for products currently in the caller's
 * wishlist (FR-17/FR-32/NFR-12). The client polls this every 30 seconds
 * (see WishlistClient.tsx) instead of re-fetching the whole page, which is
 * what keeps this cheap even with thousands of concurrent users (NFR-10).
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    select: {
      productId: true,
      product: {
        select: { id: true, inStock: true, stock: true, price: true, updatedAt: true }
      }
    }
  });

  const results: StockSyncResult[] = items.map((item) => ({
    id: item.product.id,
    inStock: item.product.inStock,
    stock: item.product.stock,
    price: Number(item.product.price),
    updatedAt: item.product.updatedAt.toISOString()
  }));

  return NextResponse.json({ results, syncedAt: new Date().toISOString() });
}
