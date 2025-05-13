// Product types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
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