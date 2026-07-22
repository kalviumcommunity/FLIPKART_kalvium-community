'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return session.user.id;
}

/** Screen 7: toggle in-stock / out-of-stock, logs to StockUpdateLog for the "recent updates" list. */
export async function setStockStatusAction(productId: string, inStock: boolean) {
  const adminId = await requireAdmin();

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      inStock,
      stock: inStock ? Math.max((await prisma.product.findUnique({ where: { id: productId } }))?.stock ?? 1, 1) : 0
    }
  });

  await prisma.stockUpdateLog.create({
    data: { productId, inStock: product.inStock, stock: product.stock, changedBy: adminId }
  });

  revalidatePath('/admin');
  revalidatePath('/wishlist');
  revalidatePath('/home');
  return { success: true };
}

/** Update raw stock quantity; inStock flips automatically at zero. */
export async function updateStockQuantityAction(productId: string, stock: number) {
  const adminId = await requireAdmin();
  const safeStock = Math.max(0, Math.floor(stock));

  const product = await prisma.product.update({
    where: { id: productId },
    data: { stock: safeStock, inStock: safeStock > 0 }
  });

  await prisma.stockUpdateLog.create({
    data: { productId, inStock: product.inStock, stock: product.stock, changedBy: adminId }
  });

  revalidatePath('/admin');
  revalidatePath('/wishlist');
  revalidatePath('/home');
  return { success: true, product };
}
