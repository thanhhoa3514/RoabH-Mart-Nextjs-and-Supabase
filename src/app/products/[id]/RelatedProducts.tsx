'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';

interface RelatedProductsProps {
    category: string;
    currentProductId: string;
}

export default function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would fetch from an API
        // Simulating API call with mock data
        setLoading(true);

        // Mock data
        const mockProducts = [
            {
                id: 3,
                product_id: 3,
                name: 'Smart Watch',
                description: 'Feature-rich smart watch with health monitoring',
                price: 199.99,
                images: [],
                stock_quantity: 8,
                stock: 8
            },
            {
                id: 7,
                product_id: 7,
                name: 'Wireless Headphones',
                description: 'Over-ear wireless headphones with noise cancellation',
                price: 149.99,
                images: [],
                stock_quantity: 20,
                stock: 20
            },
            {
                id: 8,
                product_id: 8,
                name: 'Bluetooth Speaker',
                description: 'Portable Bluetooth speaker with 20-hour battery life',
                price: 79.99,
                images: [],
                stock_quantity: 25,
                stock: 25
            },
            {
                id: 9,
                product_id: 9,
                name: 'Digital Camera',
                description: 'High-resolution digital camera with 4K video recording',
                price: 499.99,
                images: [],
                stock_quantity: 5,
                stock: 5
            },
        ];

        // Filter by category and exclude current product
        const filteredProducts = mockProducts
            .filter(product => product.id !== Number(currentProductId))
            .slice(0, 4); // Limit to 4 products

        setTimeout(() => {
            setProducts(filteredProducts as unknown as Product[]);
            setLoading(false);
        }, 500);
    }, [category, currentProductId]);

    if (loading) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                    <ProductCard
                        key={product.product_id || product.id || `related-local-${index}`}
                        product={product}
                    />
                ))}
            </div>
        </div>
    );
} 