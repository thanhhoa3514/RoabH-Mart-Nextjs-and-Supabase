import { Subcategory } from "../category/subcategory.model";
import { ProductImage, Seller } from "../supabase";

export interface Product {
    product_id: number;
    subcategory_id: number;
    seller_id: number;
    name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
    discount_percentage: number | null;
    sku: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Virtual/Join fields
    subcategory?: Subcategory;
    seller?: Seller;
    images?: ProductImage[];
    slug?: string;

    // Legacy support (to be removed once all components are updated)
    id?: number;
    stock?: number;
}
