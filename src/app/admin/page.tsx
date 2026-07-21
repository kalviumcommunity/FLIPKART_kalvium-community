import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeProduct } from '@/lib/serialize';
import { AdminTable } from '@/components/AdminTable';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/home');

  const query = searchParams.q?.trim() ?? '';

  const [products, recentUpdates] = await Promise.all([
    prisma.product.findMany({
      where: query ? { name: { contains: query, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' }
    }),
    prisma.stockUpdateLog.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 8
    })
  ]);

  return (
    <div className="space-y-4">
      <AdminTable products={products.map(serializeProduct)} />

      <div className="bg-white rounded-sm p-6">
        <h2 className="font-bold mb-4">Recent Stock Updates</h2>
        {recentUpdates.length === 0 ? (
          <p className="text-sm text-gray-500">No stock changes yet.</p>
        ) : (
          <ul className="divide-y text-sm">
            {recentUpdates.map((log) => (
              <li key={log.id} className="py-2 flex justify-between">
                <span>{log.product.name}</span>
                <span className={log.inStock ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                  {log.inStock ? `In Stock (${log.stock})` : 'Out of Stock'}
                </span>
                <span className="text-gray-400">{log.createdAt.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
