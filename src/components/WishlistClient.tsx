'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCw, Heart, Trash2, ArrowRightLeft } from 'lucide-react';
import type { WishlistItemDTO } from '@/types';
import { StockBadge } from '@/components/StockBadge';
import { moveToCartAction, removeFromWishlistAction } from '@/lib/actions/wishlist';
import { useToast } from '@/components/Toast';

const SYNC_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_WISHLIST_SYNC_INTERVAL_MS ?? 30000);

export function WishlistClient({ initialItems }: { initialItems: WishlistItemDTO[] }) {
  const [items, setItems] = useState(initialItems);
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(Date.now());
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [nowTick, setNowTick] = useState(Date.now());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const itemsRef = useRef(items);
  itemsRef.current = items;

  // FR-13/FR-31: poll stock status for wishlist items only, every 30 seconds.
  const syncStock = useCallback(async () => {
    if (itemsRef.current.length === 0) {
      setLastSyncedAt(Date.now());
      return;
    }
    try {
      const res = await fetch('/api/wishlist/sync', { cache: 'no-store' });
      if (!res.ok) return; // NFR-05/FR-34: fail silently, retry on next interval
      const data = await res.json();
      const byId = new Map<string, { inStock: boolean; stock: number; price: number }>(
        data.results.map((r: any) => [r.id, r])
      );

      const changed = new Set<string>();
      setItems((prev) =>
        prev.map((item) => {
          const fresh = byId.get(item.product.id);
          if (!fresh) return item;
          if (fresh.inStock !== item.product.inStock || fresh.price !== item.product.price) {
            changed.add(item.product.id);
          }
          return { ...item, product: { ...item.product, ...fresh } };
        })
      );

      if (changed.size > 0) {
        setFlashIds(changed);
        setTimeout(() => setFlashIds(new Set()), 1200);
      }
      setLastSyncedAt(Date.now());
    } catch {
      // network hiccup — next interval will retry (NFR-05)
    }
  }, []);

  useEffect(() => {
    const syncTimer = setInterval(syncStock, SYNC_INTERVAL_MS);
    const tickTimer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => {
      clearInterval(syncTimer);
      clearInterval(tickTimer);
    };
  }, [syncStock]);

  function secondsAgo() {
    return Math.max(0, Math.round((nowTick - lastSyncedAt) / 1000));
  }

  async function handleMoveToCart(item: WishlistItemDTO) {
    // US-401/FR-19: optimistic removal before server confirmation
    setItems((prev) => prev.filter((i) => i.wishlistId !== item.wishlistId));
    showToast('Moving item to cart\u2026', 'info');

    const result = await moveToCartAction(item.wishlistId, item.product.id);

    if (!result.success) {
      // US-403: restore the item if validation failed server-side
      setItems((prev) => [item, ...prev]);
      showToast('Sorry! This product just went out of stock.', 'error');
    } else {
      showToast('Moved to cart', 'success');
    }
  }

  async function handleRemove(item: WishlistItemDTO) {
    setPendingIds((prev) => new Set(prev).add(item.wishlistId));
    setItems((prev) => prev.filter((i) => i.wishlistId !== item.wishlistId));
    try {
      await removeFromWishlistAction(item.wishlistId);
    } catch {
      setItems((prev) => [item, ...prev]);
      showToast('Could not remove item', 'error');
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.wishlistId);
        return next;
      });
    }
  }

  if (items.length === 0) {
    // Empty Wishlist State
    return (
      <div className="bg-white rounded-sm p-16 text-center space-y-3">
        <Heart size={40} className="mx-auto text-gray-300" />
        <h2 className="text-lg font-bold text-gray-700">Your wishlist is empty!</h2>
        <p className="text-sm text-gray-500">Add items you love to your wishlist. Review them anytime and easily move them to the bag.</p>
        <Link href="/home" className="inline-block mt-2 bg-flipkart-blue text-white font-bold px-6 py-2 rounded-sm">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Wishlist ({items.length})</h1>
      </div>

      <div className="bg-blue-50 border border-blue-100 text-flipkart-blue text-sm rounded-sm p-3 flex items-center gap-2">
        <RefreshCw size={14} />
        Wishlist stock is automatically refreshed every 30 seconds.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isFlashing = flashIds.has(item.product.id);
          const isPending = pendingIds.has(item.wishlistId);
          return (
            <div
              key={item.wishlistId}
              className={`bg-white rounded-sm p-4 flex gap-4 shadow-sm transition-colors ${
                isFlashing ? 'animate-stock-change' : ''
              } ${isPending ? 'opacity-50' : ''}`}
            >
              <Link href={`/product/${item.product.id}`} className="shrink-0">
                <div className="w-24 h-24 flex items-center justify-center border border-gray-100 rounded-sm">
                  <Image src={item.product.image} alt={item.product.name} width={90} height={90} className="max-h-full object-contain" />
                </div>
              </Link>

              <div className="flex-1 flex flex-col">
                <Link href={`/product/${item.product.id}`} className="text-sm font-medium text-gray-800 line-clamp-2">
                  {item.product.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold">₹{item.product.price.toLocaleString()}</span>
                  <StockBadge inStock={item.product.inStock} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Updated {secondsAgo() === 0 ? 'just now' : `${secondsAgo()} seconds ago`}
                </p>

                <div className="mt-auto pt-2 flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={!item.product.inStock || isPending}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-sm transition-colors ${
                      item.product.inStock
                        ? 'bg-flipkart-blue text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowRightLeft size={13} />
                    {item.product.inStock ? 'Move to Cart' : 'Currently Out of Stock'}
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    disabled={isPending}
                    className="px-3 py-2 text-xs font-bold rounded-sm border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
