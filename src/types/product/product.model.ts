import { Subcategory } from "../category/subcategory.model";
import { ProductImage, Seller } from "../supabase";

export type Product = {
    product_id: string;
    subcategory_id?: string;
    seller_id: string;
    name: string;
    description?: string;
    price: number;
    stock_quantity: number;
    discount_percentage?: number;
    sku?: string;
    is_active: boolean;
    subcategory?: Subcategory;
    seller?: Seller;
    images?: ProductImage[];
    slug?: string; // For URL-friendly paths
};
