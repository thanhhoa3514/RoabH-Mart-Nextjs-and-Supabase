'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/services/supabase';
import { Product } from '@/types/supabase';
import { PRODUCTS_PER_PAGE } from '@/services/constants';

export function useProducts(categoryId?: string, subcategoryId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const searchParams = useSearchParams();

  // Get current page from URL or default to 1
  const page = Number(searchParams.get('page') ?? 1);

  // Get sort parameter from URL
  const sort = searchParams.get('sort') ?? 'newest';

  // Get search query from URL
  const query = searchParams.get('q') ?? '';

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getProducts({
        categoryId,
        subcategoryId,
        search: query,
        sort: sort as string,
        page,
        limit: PRODUCTS_PER_PAGE
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setProducts(response.data as Product[]);
      setTotalProducts(response.count || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError((err as Error).message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, subcategoryId, page, sort, query]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Calculate total pages
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  return {
    products,
    isLoading,
    error,
    page,
    totalPages,
    totalProducts,
    refetch: fetchProducts,
  };
}
