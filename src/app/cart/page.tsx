import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeProduct } from '@/lib/serialize';
import { CartClient } from '@/components/CartClient';
import type { CartItemDTO } from '@/types';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="bg-white rounded-sm p-16 text-center text-gray-500">Please log in to view your cart.</div>;
  }

  const rows = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  const items: CartItemDTO[] = rows.map((row) => ({
    cartItemId: row.id,
    quantity: row.quantity,
    product: serializeProduct(row.product)
  }));

  return <CartClient initialItems={items} />;
}
