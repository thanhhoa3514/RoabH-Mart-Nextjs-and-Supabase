// Product types
export interface Product {
    id: number;
    product_id: number;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    stock: number;
    discount_percentage?: number;
    rating?: number;
    is_featured?: boolean;
    images: string[];
    category?: string;
    subcategory?: string;
    seller?: {
        id: number;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

// User types
export interface User {
    id: string;
    email: string;
    fullName?: string;
    avatar?: string;
}

export interface Profile {
    id: string;
    userId: string;
    fullName: string;
    address: string;
    phone: string;
    avatar?: string;
}

// Cart types
export interface CartItem {
    productId: string;
    product: Product;
    quantity: number;
}

export interface Cart {
    items: CartItem[];
    total: number;
}

// Order types
export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    shippingAddress: string;
    paymentMethod: string;
    createdAt: string;
}

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

// Theme types
export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
}

// Category types
export interface Category {
    category_id: number;
    name: string;
    description: string | null;
    image: string | null;
    is_active: boolean;
    display_order: number;
}

export interface Subcategory {
    subcategory_id: number;
    category_id: number;
    name: string;
    description: string | null;
    image: string | null;
    is_active: boolean;
    display_order: number;
}

// // Database Order types
// export interface DbOrder {
//     order_id: number;
//     user_id: number;
//     order_number: string;
//     total_amount: number;
//     status: string;
//     order_date: string;
// }

// export interface DbOrderItem {
//     order_item_id: number;
//     order_id: number;
//     product_id: number;
//     quantity: number;
//     unit_price: number;
//     subtotal: number;
// }

// export interface DbPayment {
//     payment_id: number;
//     order_id: number;
//     amount: number;
//     payment_method: string;
//     transaction_id: string | null;
//     status: string;
//     payment_date: string;
// }

// export interface DbShippingInfo {
//     shipping_id: number;
//     order_id: number;
//     shipping_method: string;
//     shipping_cost: number;
//     tracking_number: string | null;
//     status: string;
//     estimated_delivery: string | null;
//     actual_delivery: string | null;
// } 