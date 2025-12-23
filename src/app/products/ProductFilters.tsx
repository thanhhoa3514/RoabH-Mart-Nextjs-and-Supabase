'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getCategories } from '@/services/supabase';
import { Category } from '@/types';

interface ProductFiltersProps {
  selectedCategory?: string;
  selectedSort?: string;
}

export default function ProductFilters({ selectedCategory, selectedSort = 'newest' }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getCategories();
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        if (data) {
          // Filter to only active categories and sort by display order
          const activeCategories = (data as Category[])
            .filter(cat => cat.is_active)
            .sort((a, b) => a.display_order - b.display_order);

          setCategories(activeCategories);
        }
      } catch (err) {
        console.error('Error in categories fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const sortOptions = [
    { id: 'newest', name: 'Newest' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
  ];

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(window.location.search);

      if (value === null || value === 'all') {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      return params.toString();
    },
    []
  );

  const handleCategoryChange = (category: string) => {
    const query = createQueryString('category', category === 'all' ? null : category);
    router.push(`${pathname}?${query}`);
  };

  const handleSortChange = (sort: string) => {
    const query = createQueryString('sort', sort);
    router.push(`${pathname}?${query}`);
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-medium mb-4">Categories</h3>
        <div className="space-y-2">
          {/* Always show "All Products" option */}
          <div className="flex items-center">
            <button
              className={`text-left w-full py-2 px-3 rounded-md transition-colors ${!selectedCategory
                ? 'bg-primary text-white'
                : 'hover:bg-secondary'
                }`}
              onClick={() => handleCategoryChange('all')}
            >
              All Products
            </button>
          </div>

          {loading ? (
            // Show loading state for categories
            <div className="animate-pulse space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-md"></div>
              ))}
            </div>
          ) : (
            // Show fetched categories
            categories.map((category) => (
              <div key={category.category_id} className="flex items-center">
                <button
                  className={`text-left w-full py-2 px-3 rounded-md transition-colors ${category.name.toLowerCase() === selectedCategory
                    ? 'bg-primary text-white'
                    : 'hover:bg-secondary'
                    }`}
                  onClick={() => handleCategoryChange(category.name.toLowerCase())}
                >
                  {category.name}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-lg font-medium mb-4">Sort By</h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <div key={option.id} className="flex items-center">
              <button
                className={`text-left w-full py-2 px-3 rounded-md transition-colors ${option.id === selectedSort
                  ? 'bg-primary text-white'
                  : 'hover:bg-secondary'
                  }`}
                onClick={() => handleSortChange(option.id)}
              >
                {option.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range - Could be implemented with a slider component */}
      <div>
        <h3 className="text-lg font-medium mb-4">Price Range</h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            placeholder="Min"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="mt-2 w-full bg-secondary text-secondary-foreground py-2 rounded-md hover:bg-secondary/90 transition-colors">
          Apply
        </button>
      </div>
    </div>
  );
} 
