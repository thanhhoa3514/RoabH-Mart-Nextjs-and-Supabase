'use client';

import { useEffect, useState, useRef } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { getProducts } from '@/services/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductListProps {
  category?: string;
  subcategory?: string;
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
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);
  const [pagination, setPagination] = useState<PaginationData>({
    count: 0,
    page: page,
    totalPages: 1,
    hasMore: false
  });
  const initialRender = useRef(true);

  useEffect(() => {
    const fetchProducts = async () => {
      // Only set loading on subsequent renders or if we have no initial data
      if (initialData.length === 0 || !initialRender.current) {
        setLoading(true);
      }

      // After first render, set initialRender to false
      initialRender.current = false;

      try {
        // Fetch products from Supabase
        const { data, error, count, totalPages } = await getProducts({
          categoryId: category,
          search,
          sort: sort as string,
          page,
          limit: itemsPerPage
        });

        if (error) {
          setError('Failed to load products. Please try again.');
          setProducts([]);
        } else if (data && data.length > 0) {
          // Data successfully fetched
          setProducts(data as Product[]);
          setError(null);
          setPagination({
            count: count || 0,
            page: page || 1,
            totalPages: totalPages || 1,
            hasMore: page < (totalPages || 1)
          });
        } else {
          // No products found
          setProducts([]);
          setError(null);
        }
      } catch {
        setError('An unexpected error occurred. Please try again later.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search, sort, page, initialData, itemsPerPage]); // Added itemsPerPage dependency

  const handlePageChange = (newPage: number) => {
    // We need to use URL navigation to change the page
    const url = new URL(window.location.href);
    url.searchParams.set('page', newPage.toString());
    window.location.href = url.toString();
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);

    // Reset to page 1 when changing items per page
    if (pagination.page !== 1) {
      const url = new URL(window.location.href);
      url.searchParams.set('page', '1');
      window.location.href = url.toString();
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(itemsPerPage)].map((_, index) => (
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
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500">
          Showing {products.length} of {pagination.count} products
          {category ? ` in ${category}` : ''}
          {search ? ` matching "${search}"` : ''}
          {pagination.totalPages > 1 ? ` (Page ${pagination.page} of ${pagination.totalPages})` : ''}
        </p>

        <div className="flex items-center space-x-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-500">Items per page:</label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded-md text-sm p-1 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            <button
              className={`px-3 py-1 border rounded-md ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              // Show current page and adjacent pages
              let pageNum = pagination.page;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 border rounded-md ${pagination.page === pageNum ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className={`px-3 py-1 border rounded-md ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 