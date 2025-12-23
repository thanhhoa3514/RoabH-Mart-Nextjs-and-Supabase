export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: number;
          username: string;
          password_hash: string;
          email: string;
          created_at: string;
          last_login: string | null;
          is_active: boolean;
        };
        Insert: {
          user_id?: number;
          username: string;
          password_hash: string;
          email: string;
          created_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
        Update: {
          user_id?: number;
          username?: string;
          password_hash?: string;
          email?: string;
          created_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
      };
      user_profiles: {
        Row: {
          profile_id: number;
          user_id: number;
          full_name: string | null;
          phone_number: string | null;
          email: string | null;
          date_of_birth: string | null;
          profile_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id?: number;
          user_id: number;
          full_name?: string | null;
          phone_number?: string | null;
          email?: string | null;
          date_of_birth?: string | null;
          profile_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: number;
          user_id?: number;
          full_name?: string | null;
          phone_number?: string | null;
          email?: string | null;
          date_of_birth?: string | null;
          profile_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          role_id: number;
          user_id: number;
          role_name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          role_id?: number;
          user_id: number;
          role_name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          role_id?: number;
          user_id?: number;
          role_name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
      };
      addresses: {
        Row: {
          address_id: number;
          user_id: number;
          street_address: string;
          city: string;
          district: string | null;
          province: string | null;
          postal_code: string;
          country: string;
          is_default: boolean;
        };
        Insert: {
          address_id?: number;
          user_id: number;
          street_address: string;
          city: string;
          district?: string | null;
          province?: string | null;
          postal_code: string;
          country: string;
          is_default?: boolean;
        };
        Update: {
          address_id?: number;
          user_id?: number;
          street_address?: string;
          city?: string;
          district?: string | null;
          province?: string | null;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
        };
      };
      payment_methods: {
        Row: {
          payment_method_id: number;
          user_id: number;
          payment_type: string;
          card_number: string | null;
          expiry_date: string | null;
          card_holder_name: string | null;
          is_default: boolean;
        };
        Insert: {
          payment_method_id?: number;
          user_id: number;
          payment_type: string;
          card_number?: string | null;
          expiry_date?: string | null;
          card_holder_name?: string | null;
          is_default?: boolean;
        };
        Update: {
          payment_method_id?: number;
          user_id?: number;
          payment_type?: string;
          card_number?: string | null;
          expiry_date?: string | null;
          card_holder_name?: string | null;
          is_default?: boolean;
        };
      };
      categories: {
        Row: {
          category_id: number;
          name: string;
          description: string | null;
          image: string | null;
          is_active: boolean;
          display_order: number;
        };
        Insert: {
          category_id?: number;
          name: string;
          description?: string | null;
          image?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
        Update: {
          category_id?: number;
          name?: string;
          description?: string | null;
          image?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
      };
      subcategories: {
        Row: {
          subcategory_id: number;
          category_id: number;
          name: string;
          description: string | null;
          image: string | null;
          is_active: boolean;
          display_order: number;
        };
        Insert: {
          subcategory_id?: number;
          category_id: number;
          name: string;
          description?: string | null;
          image?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
        Update: {
          subcategory_id?: number;
          category_id?: number;
          name?: string;
          description?: string | null;
          image?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
      };
      sellers: {
        Row: {
          seller_id: number;
          name: string;
          description: string | null;
          contact_info: string;
          logo: string | null;
          is_verified: boolean;
          joined_date: string;
        };
        Insert: {
          seller_id?: number;
          name: string;
          description?: string | null;
          contact_info: string;
          logo?: string | null;
          is_verified?: boolean;
          joined_date?: string;
        };
        Update: {
          seller_id?: number;
          name?: string;
          description?: string | null;
          contact_info?: string;
          logo?: string | null;
          is_verified?: boolean;
          joined_date?: string;
        };
      };
      products: {
        Row: {
          product_id: number;
          subcategory_id: number | null;
          seller_id: number;
          name: string;
          description: string | null;
          price: number;
          stock_quantity: number;
          discount_percentage: number | null;
          sku: string | null;
          is_active: boolean;
        };
        Insert: {
          product_id?: number;
          subcategory_id?: string | null;
          seller_id: number;
          name: string;
          description?: string | null;
          price: number;
          stock_quantity?: number;
          discount_percentage?: number | null;
          sku?: string | null;
          is_active?: boolean;
        };
        Update: {
          product_id?: number;
          subcategory_id?: string | null;
          seller_id?: number;
          name?: string;
          description?: string | null;
          price?: number;
          stock_quantity?: number;
          discount_percentage?: number | null;
          sku?: string | null;
          is_active?: boolean;
        };
      };
      product_images: {
        Row: {
          image_id: number;
          product_id: number;
          image_url: string;
          is_primary: boolean;
          display_order: number;
        };
        Insert: {
          image_id?: number;
          product_id: number;
          image_url: string;
          is_primary?: boolean;
          display_order?: number;
        };
        Update: {
          image_id?: number;
          product_id?: number;
          image_url?: string;
          is_primary?: boolean;
          display_order?: number;
        };
      };
      carts: {
        Row: {
          cart_id: number;
          user_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          cart_id?: number;
          user_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          cart_id?: number;
          user_id?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          cart_item_id: number;
          cart_id: number;
          product_id: number;
          quantity: number;
          added_at: string;
        };
        Insert: {
          cart_item_id?: number;
          cart_id: number;
          product_id: number;
          quantity?: number;
          added_at?: string;
        };
        Update: {
          cart_item_id?: number;
          cart_id?: number;
          product_id?: number;
          quantity?: number;
          added_at?: string;
        };
      };
      orders: {
        Row: {
          order_id: number;
          user_id: number;
          order_number: string;
          total_amount: number;
          status: string;
          order_date: string;
        };
        Insert: {
          order_id?: number;
          user_id: number;
          order_number: string;
          total_amount: number;
          status?: string;
          order_date?: string;
        };
        Update: {
          order_id?: number;
          user_id?: number;
          order_number?: string;
          total_amount?: number;
          status?: string;
          order_date?: string;
        };
      };
      order_items: {
        Row: {
          order_item_id: number;
          order_id: number;
          product_id: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Insert: {
          order_item_id?: number;
          order_id: number;
          product_id: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Update: {
          order_item_id?: number;
          order_id?: number;
          product_id?: number;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
        };
      };
      payments: {
        Row: {
          payment_id: number;
          order_id: number;
          amount: number;
          payment_method: string;
          transaction_id: string | null;
          status: string;
          payment_date: string;
        };
        Insert: {
          payment_id?: number;
          order_id: number;
          amount: number;
          payment_method: string;
          transaction_id?: string | null;
          status: string;
          payment_date?: string;
        };
        Update: {
          payment_id?: number;
          order_id?: number;
          amount?: number;
          payment_method?: string;
          transaction_id?: string | null;
          status?: string;
          payment_date?: string;
        };
      };
      shipping_info: {
        Row: {
          shipping_id: number;
          order_id: number;
          shipping_method: string;
          shipping_cost: number;
          tracking_number: string | null;
          status: string;
          estimated_delivery: string | null;
          actual_delivery: string | null;
        };
        Insert: {
          shipping_id?: number;
          order_id: number;
          shipping_method: string;
          shipping_cost: number;
          tracking_number?: string | null;
          status?: string;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
        };
        Update: {
          shipping_id?: number;
          order_id?: number;
          shipping_method?: string;
          shipping_cost?: number;
          tracking_number?: string | null;
          status?: string;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
        };
      };
      reviews: {
        Row: {
          review_id: number;
          product_id: number;
          user_id: number;
          rating: number;
          comment: string | null;
          review_date: string;
          is_verified_purchase: boolean;
        };
        Insert: {
          review_id?: number;
          product_id: number;
          user_id: number;
          rating: number;
          comment?: string | null;
          review_date?: string;
          is_verified_purchase?: boolean;
        };
        Update: {
          review_id?: number;
          product_id?: number;
          user_id?: number;
          rating?: number;
          comment?: string | null;
          review_date?: string;
          is_verified_purchase?: boolean;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}; 