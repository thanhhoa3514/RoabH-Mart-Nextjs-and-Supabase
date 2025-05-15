'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  discount: number;
  seller: string;
}

export default function TestPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Function to fetch products
  async function fetchProducts(pageNum = 1) {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/test-products?page=${pageNum}&limit=6`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error fetching products');
      }
      
      if (data.success && data.products) {
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages || 1);
      } else {
        setProducts([]);
        setError('No products found');
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Products Page</h1>
        <p className="text-gray-600">
          This page fetches real products from your Supabase database.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-xl">Loading products...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-6">
              <p>No products found. Make sure your Supabase database has product data.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 bg-gray-200">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200">
                          <p className="text-gray-500">No image</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                      <p className="text-gray-700 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="bg-gray-200 px-2 py-1 rounded">{product.category}</span>
                        <span>{product.seller}</span>
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <Link href={`/products/${product.id}`} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded ${
                    page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded ${
                    page === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
} 