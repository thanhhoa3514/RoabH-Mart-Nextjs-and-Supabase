'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { getProducts } from '@/lib/supabase/products/client/product.query';

interface ProductListProps {
  category?: string;
  search?: string;
  sort?: string;
  page: number;
  initialData?: Product[];
}

export default function ProductList({ 
  category, 
  search, 
  sort = 'newest', 
  page = 1,
  initialData = []
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      // If parameter changes or we don't have initial data, fetch new data
      if (initialData.length === 0 || products !== initialData) {
        setLoading(true);
      }

      try {
        // Fetch products from Supabase
        const { data, error, count } = await getProducts({
          category,
          search,
          sort,
          page,
          limit: 9 // Display 9 products per page
        });

        if (error) {
          console.error('Error fetching products:', error);
          setProducts([]);
        } else if (data) {
          setProducts(data);
          if (count !== null) setTotalCount(count);
        }
      } catch (err) {
        console.error('Error in products fetch:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search, sort, page, initialData]);

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