'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface ProductFiltersProps {
  selectedCategory?: string;
  selectedSort?: string;
}

export default function ProductFilters({ selectedCategory, selectedSort = 'newest' }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'home', name: 'Home & Garden' },
  ];

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
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <button
                className={`text-left w-full py-2 px-3 rounded-md transition-colors ${
                  (category.id === 'all' && !selectedCategory) || category.id === selectedCategory
                    ? 'bg-primary text-white'
                    : 'hover:bg-secondary'
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-lg font-medium mb-4">Sort By</h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <div key={option.id} className="flex items-center">
              <button
                className={`text-left w-full py-2 px-3 rounded-md transition-colors ${
                  option.id === selectedSort
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