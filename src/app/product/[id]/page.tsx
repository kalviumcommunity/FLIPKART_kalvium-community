import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeProduct } from '@/lib/serialize';
import { ProductDetailActions } from '@/components/ProductDetailActions';
import { ProductCard } from '@/components/ProductCard';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  const [isWishlisted, related] = await Promise.all([
    session?.user?.id
      ? prisma.wishlist.findUnique({
          where: { userId_productId: { userId: session.user.id, productId: product.id } }
        })
      : null,
    prisma.product.findMany({
      where: { category: product.category, id: { not: product.id } },
      take: 4
    })
  ]);

  const dto = serializeProduct(product);
  const wishlistedIds = session?.user?.id
    ? new Set(
        (
          await prisma.wishlist.findMany({
            where: { userId: session.user.id, productId: { in: related.map((r) => r.id) } },
            select: { productId: true }
          })
        ).map((w) => w.productId)
      )
    : new Set<string>();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-sm p-4 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 space-y-4">
          <div className="border border-gray-100 p-4 rounded-sm flex items-center justify-center h-[400px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dto.image} alt={dto.name} className="max-h-full max-w-full object-contain" />
          </div>
          <ProductDetailActions product={dto} initialWishlisted={!!isWishlisted} isAuthenticated={!!session} />
        </div>

        <div className="flex-1 space-y-4">
          <nav className="text-xs text-gray-500 flex items-center gap-2">
            <span>Home</span> {'>'} <span>{dto.category}</span> {'>'} <span className="text-gray-400">{dto.name}</span>
          </nav>

          <h1 className="text-xl font-medium">{dto.name}</h1>

          <div className="flex items-center gap-3">
            <div className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
              {dto.rating} ★
            </div>
            <span className="text-gray-500 text-sm font-medium">
              {dto.reviewCount.toLocaleString()} Ratings & {Math.floor(dto.reviewCount / 10).toLocaleString()} Reviews
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-green-600 text-sm font-bold">Special price</p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold">₹{dto.price.toLocaleString()}</span>
              <span className="text-gray-500 line-through text-lg">₹{dto.originalPrice.toLocaleString()}</span>
              <span className="text-green-600 text-lg font-bold">
                {Math.round(((dto.originalPrice - dto.price) / dto.originalPrice) * 100)}% off
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="font-bold mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{dto.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((r) => (
              <ProductCard
                key={r.id}
                product={serializeProduct(r)}
                initialWishlisted={wishlistedIds.has(r.id)}
                isAuthenticated={!!session}
              />
            ))}
          </div>
        </div>
      )}

      <Link href="/home" className="inline-block text-flipkart-blue text-sm font-medium">
        ← Back to Home
      </Link>
    </div>
  );
}
