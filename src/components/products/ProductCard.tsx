'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const handleAddToCart = () => {
        // This would be replaced with actual cart functionality
        console.log(`Added ${product.name} to cart`);
        // In a real implementation, this would dispatch an action to add to cart
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            <Link href={`/products/${product.id}`}>
                <div className="relative h-64">
                    <Image
                        src={product.images[0] || 'https://placekitten.com/300/300'} // Fallback image
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>
            </Link>
            <div className="p-4">
                <Link href={`/products/${product.id}`}>
                    <h3 className="font-medium text-lg mb-2 hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex justify-between items-center">
                    <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
                    <button
                        onClick={handleAddToCart}
                        className="bg-primary text-white p-2 rounded-full hover:bg-opacity-90 transition-colors"
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                    {product.stock > 0 ? (
                        <span className="text-green-600">In Stock</span>
                    ) : (
                        <span className="text-red-600">Out of Stock</span>
                    )}
                </div>
            </div>
        </div>
    );
} 