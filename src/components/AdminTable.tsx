'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import type { ProductDTO } from '@/types';
import { setStockStatusAction, updateStockQuantityAction } from '@/lib/actions/admin';
import { useToast } from '@/components/Toast';

export function AdminTable({ products }: { products: ProductDTO[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin?q=${encodeURIComponent(query)}`);
  }

  function toggleStock(product: ProductDTO) {
    startTransition(async () => {
      await setStockStatusAction(product.id, !product.inStock);
      showToast(`${product.name} marked ${!product.inStock ? 'in stock' : 'out of stock'}`, 'success');
      router.refresh();
    });
  }

  function updateQuantity(product: ProductDTO, quantity: number) {
    startTransition(async () => {
      await updateStockQuantityAction(product.id, quantity);
      router.refresh();
    });
  }

  return (
    <div className="bg-white shadow-sm rounded-sm">
      <div className="p-6 border-b flex items-center justify-between bg-gray-50">
        <div>
          <h1 className="text-xl font-bold">Inventory Management</h1>
          <p className="text-xs text-gray-500">Manage product availability for the Smart Wishlist System</p>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search products..."
            className="pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-1 ring-flipkart-blue"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Product Info</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock Qty</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Image src={product.image} alt={product.name} width={40} height={40} className="object-contain" />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{product.category}</td>
                <td className="px-6 py-4 font-bold">₹{product.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    min={0}
                    defaultValue={product.stock}
                    disabled={isPending}
                    onBlur={(e) => updateQuantity(product, Number(e.target.value))}
                    className="w-20 border rounded px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-6 py-4">
                  {product.inStock ? (
                    <span className="flex items-center gap-1.5 text-green-600 font-medium">
                      <CheckCircle size={16} /> In Stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-500 font-medium">
                      <XCircle size={16} /> Out of Stock
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    disabled={isPending}
                    onClick={() => toggleStock(product)}
                    className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                      product.inStock
                        ? 'border border-red-200 text-red-500 hover:bg-red-50'
                        : 'border border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    MARK {product.inStock ? 'OUT OF STOCK' : 'IN STOCK'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
        <p>Showing {products.length} products</p>
      </div>
    </div>
  );
}
