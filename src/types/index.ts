export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  updatedAt: string;
}

export interface WishlistItemDTO {
  wishlistId: string;
  addedAt: string;
  product: ProductDTO;
}

export interface CartItemDTO {
  cartItemId: string;
  quantity: number;
  product: ProductDTO;
}

/** Minimal shape returned by the 30s polling endpoint — kept small on purpose (FR-32). */
export interface StockSyncResult {
  id: string;
  inStock: boolean;
  stock: number;
  price: number;
  updatedAt: string;
}
