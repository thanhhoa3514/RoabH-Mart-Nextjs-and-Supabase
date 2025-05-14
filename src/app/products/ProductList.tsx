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

interface PaginationData {
  count: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    count: 0,
    page: page,
    totalPages: 1,
    hasMore: false
  });

  useEffect(() => {
    const fetchProducts = async () => {
      // If parameter changes or we don't have initial data, fetch new data
      if (initialData.length === 0 || products !== initialData) {
        setLoading(true);
      }

      try {
        // Fetch products from Supabase
        const { data, error, count, page: currentPage, totalPages, hasMore } = await getProducts({
          category,
          search,
          sort,
          page,
          limit: 9 // Display 9 products per page
        });

        if (error) {
          console.error('Error fetching products:', error);
          setError('Failed to load products. Please try again.');
          setProducts([]);
        } else if (data && data.length > 0) {
          // Data successfully fetched
          setProducts(data);
          setError(null);
          setPagination({
            count: count || 0,
            page: currentPage || page,
            totalPages: totalPages || 1,
            hasMore: hasMore || false
          });
        } else {
          // No products found
          setProducts([]);
          setError(null);
        }
      } catch (err) {
        console.error('Error in products fetch:', err);
        setError('An unexpected error occurred. Please try again later.');
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

  if (error) {
    return (
      <div className="text-center py-8 px-4 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-xl font-medium mb-2 text-red-600">Error</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-2">No products found</h2>
        <p className="text-gray-500">
          {category ? `No products found in ${category}` : 
           search ? `No results for "${search}"` : 
           'Try changing your filters or search term'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-gray-500">
        Showing {products.length} of {pagination.count} products 
        {category ? ` in ${category}` : ''}
        {search ? ` matching "${search}"` : ''}
        {pagination.totalPages > 1 ? ` (Page ${pagination.page} of ${pagination.totalPages})` : ''}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
} 