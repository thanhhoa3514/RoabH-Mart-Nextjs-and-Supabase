'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://placekitten.com/300/300'; // Placeholder

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-48 bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain"
          />
          {product.discount_percentage && product.discount_percentage > 0 && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
              {product.discount_percentage}% OFF
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-gray-800 group-hover:text-amber-500 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= (product.rating || 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {product.rating && (
              <span className="text-xs text-gray-500 ml-1">
                ({product.rating.toFixed(1)})
              </span>
            )}
          </div>
          
          <div className="mt-2 flex justify-between items-center">
            <span className="font-bold">${product.price.toFixed(2)}</span>
            
            {product.stock_quantity <= 0 ? (
              <span className="text-xs text-red-500">Out of Stock</span>
            ) : (
              <span className="text-xs text-green-600">In Stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 