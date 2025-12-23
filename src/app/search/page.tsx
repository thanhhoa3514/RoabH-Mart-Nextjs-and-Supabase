import { getProducts } from '@/services/supabase/products/product.service';
import SearchInput from '@/components/search/SearchInput';
import ProductGrid from '@/components/products/ProductGrid';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  // Fetch products based on search query
  const { data: products, error } = await getProducts(undefined, query);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Products</h1>

      {/* Search input */}
      <div className="mb-8">
        <SearchInput initialQuery={query} />
      </div>

      {/* Search results */}
      <div>
        {query ? (
          <h2 className="text-xl mb-4">
            Search results for: <span className="font-medium">&quot;{query}&quot;</span>
            {products && <span className="text-sm text-gray-500 ml-2">({products.length} items found)</span>}
          </h2>
        ) : (
          <h2 className="text-xl mb-4">Browse all products</h2>
        )}

        <Suspense fallback={<LoadingSpinner />}>
          {error ? (
            <div className="text-red-500">Error loading products: {error.message}</div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products found{query ? ` for &quot;${query}&quot;` : ''}.</p>
              {query && <p className="text-gray-500">Try a different search term or browse our categories.</p>}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </Suspense>
      </div>
    </div>
  );
} 
