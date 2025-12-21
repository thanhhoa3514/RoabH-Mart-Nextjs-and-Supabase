// Database models

import type { Product } from "./index";
export type { Product };
import { Category } from "./category/category.model";

export type User = {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
};

export type UserProfile = {
  profile_id: string;
  user_id: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  date_of_birth?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
};

export type Role = {
  role_id: string;
  user_id: string;
  role_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type Address = {
  address_id: string;
  user_id: string;
  street_address: string;
  city: string;
  district?: string;
  province?: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

export type PaymentMethod = {
  payment_method_id: string;
  user_id: string;
  payment_type: string;
  card_number?: string;
  expiry_date?: string;
  card_holder_name?: string;
  is_default: boolean;
};



export type Seller = {
  seller_id: string;
  name: string;
  description?: string;
  contact_info: string;
  logo?: string;
  is_verified: boolean;
  joined_date: string;
};


export type ProductImage = {
  image_id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
};

export type Cart = {
  cart_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
};

export type CartItem = {
  cart_item_id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  product?: Product;
};

export type Order = {
  order_id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  order_date: string;
  items?: OrderItem[];
  shipping?: ShippingInfo;
  payment?: Payment;
};

export type OrderItem = {
  order_item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
};

export type Payment = {
  payment_id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status: string;
  payment_date: string;
};

export type ShippingInfo = {
  shipping_id: string;
  order_id: string;
  shipping_method: string;
  shipping_cost: number;
  tracking_number?: string;
  status: string;
  estimated_delivery?: string;
  actual_delivery?: string;
};

export type Review = {
  review_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  review_date: string;
  is_verified_purchase: boolean;
  user?: User;
}; 