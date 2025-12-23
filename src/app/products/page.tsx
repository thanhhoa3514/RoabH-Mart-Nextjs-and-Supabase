import { Suspense } from 'react';
import ProductList from './ProductList';
import ProductFilters from './ProductFilters';
import { getProducts } from '@/services/supabase';

interface ProductsPageProps {
  searchParams: {
    categoryId?: string;
    subcategoryId?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { categoryId, subcategoryId, search, sort = 'newest', page = '1' } = searchParams;

  // Prefetch initial data to hydrate page - this improves SEO and initial load time
  const productsResult = await getProducts({
    categoryId,
    subcategoryId,
    search,
    sort,
    page: parseInt(page),
    limit: 9
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {categoryId
          ? `${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Products`
          : 'All Products'
        }
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-1/4">
          <ProductFilters
            selectedCategory={categoryId}
            selectedSort={sort}
          />
        </div>

        {/* Product Grid */}
        <div className="w-full lg:w-3/4">
          <Suspense fallback={<div>Loading products...</div>}>
            <ProductList
              category={categoryId}
              subcategory={subcategoryId}
              search={search}
              sort={sort}
              page={parseInt(page)}
              initialData={productsResult.data || []}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 