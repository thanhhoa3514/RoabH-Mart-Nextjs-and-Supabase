'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/providers/cart-provider';

export default function CartCount() {
  const { totalItems, isLoading } = useCart();
  
  return (
    <Link href="/cart" className="relative flex items-center">
      <ShoppingCart className="h-6 w-6 text-gray-700" />
      {!isLoading && totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
} 
