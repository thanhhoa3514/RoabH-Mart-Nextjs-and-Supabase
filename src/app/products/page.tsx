import { Suspense } from 'react';
import ProductList from './ProductList';
import ProductFilters from './ProductFilters';
import { getProducts } from '@/lib/supabase/products/client/product.query';
import { getCategories } from '@/lib/supabase/categories/categories.model';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, search, sort = 'newest', page = '1' } = searchParams;
  
  // Prefetch initial data to hydrate page - this improves SEO and initial load time
  const initialProductsPromise = getProducts({
    category,
    search,
    sort,
    page: parseInt(page),
    limit: 9
  });
  
  const initialCategoriesPromise = getCategories();
  
  // Wait for both promises to resolve
  const [productsResult, categoriesResult] = await Promise.all([
    initialProductsPromise,
    initialCategoriesPromise
  ]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {category 
          ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
          : 'All Products'
        }
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-1/4">
          <ProductFilters 
            selectedCategory={category}
            selectedSort={sort}
          />
        </div>
        
        {/* Product Grid */}
        <div className="w-full lg:w-3/4">
          <Suspense fallback={<div>Loading products...</div>}>
            <ProductList 
              category={category}
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