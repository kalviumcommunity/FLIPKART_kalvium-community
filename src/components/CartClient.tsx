'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItemDTO } from '@/types';
import { removeFromCartAction, updateCartQuantityAction } from '@/lib/actions/cart';
import { useToast } from '@/components/Toast';

const DELIVERY_CHARGE_THRESHOLD = 500;
const DELIVERY_CHARGE = 40;

export function CartClient({ initialItems }: { initialItems: CartItemDTO[] }) {
  const [items, setItems] = useState(initialItems);
  const { showToast } = useToast();

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [items]);
  const delivery = subtotal === 0 || subtotal >= DELIVERY_CHARGE_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal + delivery;

  async function handleQuantityChange(item: CartItemDTO, nextQty: number) {
    if (nextQty < 1) return handleRemove(item);
    const clamped = Math.min(nextQty, item.product.stock || 1);
    setItems((prev) => prev.map((i) => (i.cartItemId === item.cartItemId ? { ...i, quantity: clamped } : i)));
    await updateCartQuantityAction(item.cartItemId, clamped);
  }

  async function handleRemove(item: CartItemDTO) {
    setItems((prev) => prev.filter((i) => i.cartItemId !== item.cartItemId));
    await removeFromCartAction(item.cartItemId);
  }

  function handleCheckout() {
    const outOfStock = items.find((i) => !i.product.inStock);
    if (outOfStock) {
      showToast('Sorry! This product is currently out of stock and cannot be added to your cart.', 'error');
      return;
    }
    showToast('This is a prototype — checkout is not implemented.', 'info');
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-sm p-16 text-center space-y-3">
        <ShoppingBag size={40} className="mx-auto text-gray-300" />
        <h2 className="text-lg font-bold text-gray-700">Your cart is empty!</h2>
        <p className="text-sm text-gray-500">Add items to it now.</p>
        <Link href="/home" className="inline-block mt-2 bg-flipkart-blue text-white font-bold px-6 py-2 rounded-sm">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 bg-white rounded-sm divide-y">
        <div className="p-4">
          <h1 className="font-bold text-lg">My Cart ({items.length})</h1>
        </div>
        {items.map((item) => (
          <div key={item.cartItemId} className="p-4 flex gap-4">
            <Link href={`/product/${item.product.id}`} className="shrink-0">
              <div className="w-24 h-24 flex items-center justify-center border border-gray-100 rounded-sm">
                <Image src={item.product.image} alt={item.product.name} width={90} height={90} className="max-h-full object-contain" />
              </div>
            </Link>
            <div className="flex-1 flex flex-col">
              <Link href={`/product/${item.product.id}`} className="text-sm font-medium text-gray-800">
                {item.product.name}
              </Link>
              {!item.product.inStock && <p className="text-red-500 text-xs font-bold mt-1">Currently Out of Stock</p>}

              <div className="flex items-center gap-4 mt-auto pt-2">
                <div className="flex items-center border rounded-sm">
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    className="p-2 text-gray-500 hover:bg-gray-50"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    className="p-2 text-gray-500 hover:bg-gray-50"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-bold">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                <button
                  onClick={() => handleRemove(item)}
                  className="ml-auto text-xs font-bold text-gray-500 hover:text-red-500 flex items-center gap-1"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full md:w-80 bg-white rounded-sm p-4 h-fit space-y-3">
        <h2 className="text-gray-400 font-bold text-sm uppercase">Price Details</h2>
        <div className="flex justify-between text-sm">
          <span>Price ({items.length} items)</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery Charges</span>
          <span className={delivery === 0 ? 'text-green-600 font-bold' : ''}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>Total Amount</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
        <button onClick={handleCheckout} className="w-full bg-flipkart-orange text-white font-bold py-3 rounded-sm mt-2">
          PLACE ORDER
        </button>
      </div>
    </div>
  );
}
