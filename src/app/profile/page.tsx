import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LogoutButton } from '@/components/LogoutButton';
import { User as UserIcon, Heart, ShoppingCart, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="bg-white rounded-sm p-16 text-center text-gray-500">Please log in to view your profile.</div>;
  }

  const [wishlistCount, cartCount, orders] = await Promise.all([
    prisma.wishlist.count({ where: { userId: session.user.id } }),
    prisma.cartItem.count({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-sm p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-flipkart-blue text-white flex items-center justify-center">
          <UserIcon size={28} />
        </div>
        <div>
          <h1 className="text-lg font-bold">{session.user.name}</h1>
          <p className="text-sm text-gray-500">{session.user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-sm p-6 flex items-center gap-3">
          <Heart className="text-flipkart-blue" />
          <div>
            <p className="text-2xl font-bold">{wishlistCount}</p>
            <p className="text-xs text-gray-500">Wishlist items</p>
          </div>
        </div>
        <div className="bg-white rounded-sm p-6 flex items-center gap-3">
          <ShoppingCart className="text-flipkart-blue" />
          <div>
            <p className="text-2xl font-bold">{cartCount}</p>
            <p className="text-xs text-gray-500">Cart items</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Package size={18} /> Recent Orders
        </h2>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <ul className="divide-y">
            {orders.map((order) => (
              <li key={order.id} className="py-3 flex justify-between text-sm">
                <span>{order.items.map((i) => i.product.name).join(', ')}</span>
                <span className="font-bold">₹{Number(order.total).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
