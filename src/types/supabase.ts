import { Category, Subcategory } from "./category/index";
import { DbUser, DbUserProfile, DbUserAddress } from "./user/user.model";
import { DbOrder, DbOrderItem, DbPayment, DbShippingInfo } from "./order/index";
import { Product } from "./product/product.model";

// Export base types for convenience in this file's consumers
export type { Product, DbUser as User, DbUserProfile as UserProfile, DbUserAddress as Address };

export interface Role {
  role_id: number;
  role_name: string;
  description: string | null;
  is_active: boolean;
}

export interface UserRole {
  user_id: number;
  role_id: number;
}

export interface Permission {
  permission_id: number;
  permission_name: string;
  description: string | null;
}

export interface RolePermission {
  role_id: number;
  permission_id: number;
}

export interface PaymentMethod {
  payment_method_id: number;
  user_id: number;
  payment_type: string;
  expiry_date: string | null;
  card_holder_name: string | null;
  is_default: boolean;
  card_token: string | null;
  last_four_digits: string | null;
}

export interface Seller {
  seller_id: number;
  user_id: number;
  shop_name: string;
  description: string | null;
  contact_info: string | null;
  logo: string | null;
  is_verified: boolean;
  joined_date: string;
}

export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Cart {
  cart_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface CartItem {
  cart_item_id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  added_at: string;
  product?: Product;
}

export type Order = DbOrder & {
  items?: OrderItem[];
  shipping?: ShippingInfo;
  payment?: Payment;
};

export type OrderItem = DbOrderItem & {
  product?: Product;
};

export type Payment = DbPayment;
export type ShippingInfo = DbShippingInfo;

export interface Review {
  review_id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  review_date: string;
  is_verified_purchase: boolean;
  user?: User;
}

export interface InventoryLog {
  log_id: number;
  product_id: number;
  change_type: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  created_by: number | null;
  created_at: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Voucher {
  voucher_id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
}
