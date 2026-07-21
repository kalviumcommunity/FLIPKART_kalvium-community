'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Zap, Info } from 'lucide-react';
import type { ProductDTO } from '@/types';
import { addToWishlistAction } from '@/lib/actions/wishlist';
import { addToCartAction } from '@/lib/actions/cart';
import { useToast } from '@/components/Toast';

export function ProductDetailActions({
  product,
  initialWishlisted,
  isAuthenticated
}: {
  product: ProductDTO;
  initialWishlisted: boolean;
  isAuthenticated: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  function requireAuth() {
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    return true;
  }

  function handleWishlist() {
    if (!requireAuth()) return;
    setWishlisted(true);
    startTransition(async () => {
      try {
        await addToWishlistAction(product.id);
        showToast('Added to wishlist', 'success');
      } catch {
        setWishlisted(false);
        showToast('Could not add to wishlist', 'error');
      }
    });
  }

  function handleAddToCart(goToCart: boolean) {
    if (!requireAuth()) return;
    startTransition(async () => {
      const result = await addToCartAction(product.id);
      if (result.success) {
        showToast('Added to cart', 'success');
        if (goToCart) router.push('/cart');
      } else {
        showToast('Sorry! This product is currently out of stock and cannot be added to your cart.', 'error');
      }
    });
  }

  return (
    <div className="space-y-3">
      {!product.inStock && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-sm flex items-start gap-3 text-red-600">
          <Info size={20} className="shrink-0" />
          <div>
            <p className="font-bold">Currently Out of Stock</p>
            <p className="text-xs mt-1">This item is currently unavailable. We&apos;ll notify you when it&apos;s back!</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          disabled={!product.inStock || isPending}
          onClick={() => handleAddToCart(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold rounded-sm transition-all ${
            product.inStock ? 'bg-flipkart-yellow text-white hover:shadow-md' : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={20} /> ADD TO CART
        </button>
        <button
          disabled={!product.inStock || isPending}
          onClick={() => handleAddToCart(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold rounded-sm transition-all ${
            product.inStock ? 'bg-flipkart-orange text-white hover:shadow-md' : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          <Zap size={20} /> BUY NOW
        </button>
      </div>

      <button
        onClick={handleWishlist}
        disabled={wishlisted || isPending}
        className={`flex items-center gap-2 font-bold transition-colors ${wishlisted ? 'text-red-500' : 'text-gray-500 hover:text-flipkart-blue'}`}
      >
        <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
        {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
      </button>
    </div>
  );
}
