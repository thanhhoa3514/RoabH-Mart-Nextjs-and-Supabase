/**
 * Product-related helper functions for Supabase
 */

import { getProductById, getProductsBySlug, getProducts, getProductsByCategory, getProductsBySubcategory } from '@/lib/supabase/db';
import { Product } from '@/types/supabase';
import { createSlug } from '../helpers';

/**
 * Fetch a product by its ID
 */
export const fetchProductById = async (productId: string) => {
  return getProductById(productId);
};

/**
 * Fetch a product by its slug
 */
export const fetchProductBySlug = async (slug: string) => {
  return getProductsBySlug(slug);
};

/**
 * Fetch all products
 */
export const fetchAllProducts = async () => {
  return getProducts();
};

/**
 * Fetch products by category
 */
export const fetchProductsByCategory = async (categoryId: string) => {
  return getProductsByCategory(categoryId);
};

/**
 * Fetch products by subcategory
 */
export const fetchProductsBySubcategory = async (subcategoryId: string) => {
  return getProductsBySubcategory(subcategoryId);
};

/**
 * Generate a unique slug for a product
 */
export const generateUniqueProductSlug = async (name: string): Promise<string> => {
  const baseSlug = createSlug(name);
  const { data: existingProducts } = await getProducts();
  
  // If no existing products, just return the base slug
  if (!existingProducts || existingProducts.length === 0) {
    return baseSlug;
  }
  
  // Check if any product has a matching slug
  // Note: Since our DB schema doesn't have a slug field, we'll generate them on the fly for comparison
  const existingSlugs = existingProducts.map(product => 
    createSlug(product.name)
  );
  
  // If no product with this slug exists
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Add a number suffix to make the slug unique
  let counter = 1;
  let candidateSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(candidateSlug)) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }
  
  return candidateSlug;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (price: number, discountPercentage: number | null): number => {
  if (!discountPercentage || discountPercentage <= 0) return 0;
  
  return discountPercentage;
};

/**
 * Calculate discounted price
 */
export const calculateDiscountedPrice = (price: number, discountPercentage: number | null): number => {
  if (!discountPercentage || discountPercentage <= 0) return price;
  
  return price * (1 - discountPercentage / 100);
};

/**
 * Filter and sort products
 */
export const filterAndSortProducts = (
  products: Product[],
  {
    subcategoryId,
    minPrice,
    maxPrice,
    sortBy = 'newest',
    search,
  }: {
    subcategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'newest' | 'price_asc' | 'price_desc';
    search?: string;
  }
): Product[] => {
  // Filter by subcategory
  let filtered = subcategoryId 
    ? products.filter(product => product.subcategory_id === subcategoryId)
    : products;
  
  // Filter by price range
  if (minPrice !== undefined) {
    filtered = filtered.filter(product => product.price >= minPrice);
  }
  
  if (maxPrice !== undefined) {
    filtered = filtered.filter(product => product.price <= maxPrice);
  }
  
  // Filter by search term
  if (search) {
    const searchTerms = search.toLowerCase().split(' ');
    filtered = filtered.filter(product => {
      return searchTerms.every(term => 
        product.name.toLowerCase().includes(term) || 
        (product.description && product.description.toLowerCase().includes(term))
      );
    });
  }
  
  // Sort products
  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'newest':
      default:
        // As with the hooks file, sort by product_id
        const idA = parseInt(a.product_id);
        const idB = parseInt(b.product_id);
        
        if (!isNaN(idA) && !isNaN(idB)) {
          return idB - idA; // Higher ID is newer
        }
        
        // Fallback to string comparison
        return b.product_id.localeCompare(a.product_id);
    }
  });
};
