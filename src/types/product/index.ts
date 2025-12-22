export interface Product {
    product_id: number;
    subcategory_id: number | null;
    seller_id: number;
    name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
    discount_percentage: number;
    sku: string | null;
    slug: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}