// Export API response types
export * from './api/index';

// Re-export all modular types
export * from './user/user.model';
export * from './product/product.model';
export * from './category/index';
export * from './order/index';

// Export specific types from supabase that don't collide
export type {
    Role,
    UserRole,
    Permission,
    RolePermission,
    PaymentMethod,
    Seller,
    ProductImage,
    Cart,
    CartItem,
    Review,
    InventoryLog,
    Notification,
    Voucher
} from './supabase';

// Theme types (kept here if they don't have a better home)
export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
}

// Order Status Enum (consistent with DB values)
export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}
