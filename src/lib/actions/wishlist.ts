'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('UNAUTHENTICATED');
  }
  return session.user.id;
}

/** FR-11: add a product to the wishlist (duplicate-safe, US-301). */
export async function addToWishlistAction(productId: string) {
  const userId = await requireUserId();

  await prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId }
  });

  revalidatePath('/wishlist');
  revalidatePath('/home');
  return { success: true };
}

/** FR-12 / FR-14: remove a product; monitoring stops automatically since the row is gone. */
export async function removeFromWishlistAction(wishlistId: string) {
  const userId = await requireUserId();

  await prisma.wishlist.deleteMany({
    where: { id: wishlistId, userId }
  });

  revalidatePath('/wishlist');
  return { success: true };
}

/**
 * FR-18–FR-22 / US-401 / US-402: move a wishlist item to the cart.
 * The client already removed the item optimistically before calling this —
 * this action re-validates stock server-side and is the single source of truth.
 * On failure the caller is responsible for restoring the wishlist item (US-403).
 */
export async function moveToCartAction(wishlistId: string, productId: string) {
  const userId = await requireUserId();

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });

    if (!product || !product.inStock || product.stock <= 0) {
      return { success: false, reason: 'OUT_OF_STOCK' as const };
    }

    await tx.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity: { increment: 1 } },
      create: { userId, productId, quantity: 1 }
    });

    await tx.wishlist.deleteMany({ where: { id: wishlistId, userId } });

    return { success: true as const };
  });

  revalidatePath('/wishlist');
  revalidatePath('/cart');
  return result;
}
