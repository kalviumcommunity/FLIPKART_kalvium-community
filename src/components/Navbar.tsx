import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NavbarSearch } from '@/components/NavbarSearch';
import { Heart, ShoppingCart, User as UserIcon } from 'lucide-react';

export async function Navbar() {
  const session = await getServerSession(authOptions);

  let wishlistCount = 0;
  let cartCount = 0;

  if (session?.user?.id) {
    [wishlistCount, cartCount] = await Promise.all([
      prisma.wishlist.count({ where: { userId: session.user.id } }),
      prisma.cartItem.count({ where: { userId: session.user.id } })
    ]);
  }

  return (
    <header className="bg-flipkart-blue text-white sticky top-0 z-40 shadow-md">
      <div className="container mx-auto max-w-[1248px] px-4 py-2.5 flex items-center gap-6">
        <Link href="/home" className="flex flex-col leading-none shrink-0">
          <span className="text-xl italic font-bold">Flipkart</span>
          <span className="text-[10px] italic text-flipkart-yellow -mt-1">
            Explzero <span className="text-white">Plus</span>
          </span>
        </Link>

        <NavbarSearch />

        <nav className="flex items-center gap-6 shrink-0 text-sm font-medium">
          {!session ? (
            <Link href="/login" className="bg-white text-flipkart-blue px-8 py-1.5 rounded-sm font-bold">
              Login
            </Link>
          ) : (
            <>
              <Link href="/wishlist" className="relative flex items-center gap-1.5">
                <Heart size={20} />
                <span className="hidden sm:inline">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-flipkart-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative flex items-center gap-1.5">
                <ShoppingCart size={20} />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-flipkart-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/profile" className="flex items-center gap-1.5">
                <UserIcon size={20} />
                <span className="hidden sm:inline">{session.user?.name?.split(' ')[0]}</span>
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="bg-white/10 px-3 py-1 rounded text-xs font-bold">
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
