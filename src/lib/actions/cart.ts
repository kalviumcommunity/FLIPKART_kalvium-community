'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('UNAUTHENTICATED');
  return session.user.id;
}

/** FR-20/FR-21: validate stock before allowing a direct "Add to Cart" (product page / grid). */
export async function addToCartAction(productId: string) {
  const userId = await requireUserId();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.inStock || product.stock <= 0) {
    return { success: false, reason: 'OUT_OF_STOCK' as const };
  }

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: { increment: 1 } },
    create: { userId, productId, quantity: 1 }
  });

  revalidatePath('/cart');
  return { success: true as const };
}

/** FR-23: update quantity, clamped to available stock. */
export async function updateCartQuantityAction(cartItemId: string, quantity: number) {
  const userId = await requireUserId();
  if (quantity < 1) return removeFromCartAction(cartItemId);

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId },
    include: { product: true }
  });
  if (!item) return { success: false, reason: 'NOT_FOUND' as const };

  const clamped = Math.min(quantity, Math.max(item.product.stock, 1));

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: clamped }
  });

  revalidatePath('/cart');
  return { success: true as const, quantity: clamped };
}

/** FR-24 */
export async function removeFromCartAction(cartItemId: string) {
  const userId = await requireUserId();
  await prisma.cartItem.deleteMany({ where: { id: cartItemId, userId } });
  revalidatePath('/cart');
  return { success: true as const };
}
