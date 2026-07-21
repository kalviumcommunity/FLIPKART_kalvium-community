import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeProduct } from '@/lib/serialize';
import { ProductCard } from '@/components/ProductCard';

export default async function HomePage({
  searchParams
}: {
  searchParams: { q?: string; category?: string };
}) {
  const session = await getServerSession(authOptions);
  const query = searchParams.q?.trim() ?? '';
  const category = searchParams.category;

  const products = await prisma.product.findMany({
    where: {
      ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
      ...(category ? { category } : {})
    },
    orderBy: { createdAt: 'desc' }
  });

  const categories = await prisma.product.findMany({
    distinct: ['category'],
    select: { category: true }
  });

  const wishlistedIds = session?.user?.id
    ? new Set(
        (
          await prisma.wishlist.findMany({
            where: { userId: session.user.id },
            select: { productId: true }
          })
        ).map((w) => w.productId)
      )
    : new Set<string>();

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-flipkart-blue to-blue-500 rounded-sm p-8 text-white flex items-center justify-between overflow-hidden">
        <div>
          <p className="text-sm uppercase tracking-widest text-flipkart-yellow font-bold">Big Saving Days</p>
          <h2 className="text-3xl font-bold mt-2">Up to 80% off</h2>
          <p className="text-white/80 mt-1 text-sm">Plus extra 10% off with Bank Offers</p>
        </div>
      </div>

      <div className="bg-white rounded-sm p-3 flex gap-3 overflow-x-auto text-sm font-medium">
        <a
          href="/home"
          className={`px-4 py-1.5 rounded-full shrink-0 ${!category ? 'bg-flipkart-blue text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c.category}
            href={`/home?category=${encodeURIComponent(c.category)}`}
            className={`px-4 py-1.5 rounded-full shrink-0 ${
              category === c.category ? 'bg-flipkart-blue text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {c.category}
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-sm p-16 text-center text-gray-500">No products match your search.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={serializeProduct(p)}
              initialWishlisted={wishlistedIds.has(p.id)}
              isAuthenticated={!!session}
            />
          ))}
        </div>
      )}
    </div>
  );
}
