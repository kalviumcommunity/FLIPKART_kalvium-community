'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { ProductDTO } from '@/types';
import { StockBadge } from '@/components/StockBadge';
import { addToWishlistAction } from '@/lib/actions/wishlist';
import { addToCartAction } from '@/lib/actions/cart';
import { useToast } from '@/components/Toast';

export function ProductCard({
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

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  function requireAuth() {
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    return true;
  }

  function handleWishlist() {
    if (!requireAuth()) return;
    setWishlisted(true); // optimistic
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

  function handleAddToCart() {
    if (!requireAuth()) return;
    startTransition(async () => {
      const result = await addToCartAction(product.id);
      if (result.success) {
        showToast('Added to cart', 'success');
      } else {
        showToast('Sorry! This product is currently out of stock.', 'error');
      }
    });
  }

  return (
    <div className="bg-white rounded-sm p-4 flex flex-col hover:shadow-lg transition-shadow relative group">
      <button
        onClick={handleWishlist}
        disabled={wishlisted || isPending}
        aria-label="Add to wishlist"
        className={`absolute top-3 right-3 z-10 ${wishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
      >
        <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
        <div className="h-40 flex items-center justify-center mb-3">
          <Image src={product.image} alt={product.name} width={160} height={160} className="max-h-40 w-auto object-contain" />
        </div>
        <h3 className="text-sm text-gray-800 line-clamp-2 flex-1">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            {product.rating} <Star size={9} fill="white" />
          </span>
          <span className="text-gray-400 text-xs">({product.reviewCount.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          <span className="text-gray-400 text-xs line-through">₹{product.originalPrice.toLocaleString()}</span>
          <span className="text-green-600 text-xs font-bold">{discount}% off</span>
        </div>
        <div className="mt-2">
          <StockBadge inStock={product.inStock} />
        </div>
      </Link>

      <button
        onClick={handleAddToCart}
        disabled={!product.inStock || isPending}
        className={`mt-3 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-sm transition-colors ${
          product.inStock
            ? 'bg-flipkart-blue text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ShoppingCart size={14} /> ADD TO CART
      </button>
    </div>
  );
}
