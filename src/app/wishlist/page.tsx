import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeProduct } from '@/lib/serialize';
import { WishlistClient } from '@/components/WishlistClient';
import type { WishlistItemDTO } from '@/types';

// Always fetch fresh wishlist data on navigation — the 30s sync then takes over client-side.
export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="bg-white rounded-sm p-16 text-center text-gray-500">
        Please log in to view your wishlist.
      </div>
    );
  }

  const rows = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  const items: WishlistItemDTO[] = rows.map((row) => ({
    wishlistId: row.id,
    addedAt: row.createdAt.toISOString(),
    product: serializeProduct(row.product)
  }));

  return <WishlistClient initialItems={items} />;
}
