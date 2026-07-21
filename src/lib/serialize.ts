import type { Product } from '@prisma/client';
import type { ProductDTO } from '@/types';

export function serializeProduct(product: Product): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    originalPrice: Number(product.originalPrice),
    category: product.category,
    image: product.image,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
    inStock: product.inStock,
    updatedAt: product.updatedAt.toISOString()
  };
}
