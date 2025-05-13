'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';

interface ProductListProps {
  category?: string;
  search?: string;
  sort?: string;
  page: number;
}

export default function ProductList({ category, search, sort = 'newest', page = 1 }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, this would fetch from an API
  useEffect(() => {
    // Simulating API call with mock data
    setLoading(true);
    
    // Mock data
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Wireless Earbuds',
        description: 'High-quality wireless earbuds with noise cancellation',
        price: 79.99,
        images: ['https://placekitten.com/300/300'],
        category: 'electronics',
        stock: 15,
        createdAt: '2023-01-15',
        updatedAt: '2023-01-15'
      },
      {
        id: '2',
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt, perfect for everyday wear',
        price: 24.99,
        images: ['https://placekitten.com/301/300'],
        category: 'clothing',
        stock: 50,
        createdAt: '2023-02-10',
        updatedAt: '2023-02-10'
      },
      {
        id: '3',
        name: 'Smart Watch',
        description: 'Feature-rich smart watch with health monitoring',
        price: 199.99,
        images: ['https://placekitten.com/302/300'],
        category: 'electronics',
        stock: 8,
        createdAt: '2023-03-05',
        updatedAt: '2023-03-05'
      },
      {
        id: '4',
        name: 'Kitchen Blender',
        description: 'Powerful kitchen blender for smoothies and food prep',
        price: 89.99,
        images: ['https://placekitten.com/303/300'],
        category: 'home',
        stock: 12,
        createdAt: '2023-01-20',
        updatedAt: '2023-01-20'
      },
      {
        id: '5',
        name: 'Denim Jeans',
        description: 'Classic denim jeans with comfortable fit',
        price: 49.99,
        images: ['https://placekitten.com/304/300'],
        category: 'clothing',
        stock: 30,
        createdAt: '2023-02-15',
        updatedAt: '2023-02-15'
      },
      {
        id: '6',
        name: 'LED TV',
        description: '4K Ultra HD Smart LED TV with HDR',
        price: 599.99,
        images: ['https://placekitten.com/305/300'],
        category: 'electronics',
        stock: 5,
        createdAt: '2023-03-10',
        updatedAt: '2023-03-10'
      },
    ];
    
    // Filter by category if provided
    let filteredProducts = mockProducts;
    if (category) {
      filteredProducts = mockProducts.filter(product => product.category === category);
    }
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort products
    if (sort === 'price-low') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    // Simulate loading delay
    setTimeout(() => {
      setProducts(filteredProducts);
      setLoading(false);
    }, 500);
  }, [category, search, sort, page]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-lg h-80 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-2">No products found</h2>
        <p className="text-gray-500">Try changing your filters or search term</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-gray-500">{products.length} products found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
} 