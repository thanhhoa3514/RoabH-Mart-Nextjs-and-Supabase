'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';

interface RelatedProductsProps {
  category?: string;
  currentProductId: number;
}

export default function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        setLoading(true);
        
        // Fetch related products by category, excluding current product
        const response = await fetch(`/api/products?category=${encodeURIComponent(category || '')}&exclude=${currentProductId}&limit=4`);
        
        if (!response.ok) {
          console.error('Error response from API:', response.status);
          setProducts([]);
          return;
        }
        
        // Get text content first to check if it's valid
        const text = await response.text();
        if (!text) {
          console.error('Empty response from API');
          setProducts([]);
          return;
        }
        
        // Parse JSON safely
        try {
          const data = JSON.parse(text);
          if (data.data) {
            // Make sure products have the product_id property for consistency
            const productsWithConsistentIds = data.data.map((p: any) => ({
              ...p,
              product_id: p.id
            }));
            setProducts(productsWithConsistentIds);
          } else {
            setProducts([]);
          }
        } catch (parseError) {
          console.error('Invalid JSON in response:', parseError);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (category) {
      fetchRelatedProducts();
    }
  }, [category, currentProductId]);

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.product_id || product.id} product={product} />
        ))}
      </div>
    </div>
  );
} 