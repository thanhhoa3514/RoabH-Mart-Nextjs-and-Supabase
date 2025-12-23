import { Product } from '@/types/supabase';

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
        subcategoryId?: number;
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
                // Sort by product_id as a proxy for date
                const idA = a.product_id;
                const idB = b.product_id;

                if (!isNaN(idA) && !isNaN(idB)) {
                    return idB - idA; // Higher ID is newer
                }

                // Fallback to string comparison
                return b.product_id.toString().localeCompare(a.product_id.toString());
        }
    });
};
