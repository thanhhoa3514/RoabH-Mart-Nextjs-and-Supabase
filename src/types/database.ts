export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          username: string;
          password_hash: string;
          email: string;
          created_at: string;
          last_login: string | null;
          is_active: boolean;
        };
        Insert: {
          user_id?: string;
          username: string;
          password_hash: string;
          email: string;
          created_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
        Update: {
          user_id?: string;
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
          profile_id: string;
          user_id: string;
          full_name: string | null;
          phone_number: string | null;
          email: string | null;
          date_of_birth: string | null;
          profile_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id?: string;
          user_id: string;
          full_name?: string | null;
          phone_number?: string | null;
          email?: string | null;
          date_of_birth?: string | null;
          profile_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          user_id?: string;
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
          role_id: string;
          user_id: string;
          role_name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          role_id?: string;
          user_id: string;
          role_name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          role_id?: string;
          user_id?: string;
          role_name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
      };
      addresses: {
        Row: {
          address_id: string;
          user_id: string;
          street_address: string;
          city: string;
          district: string | null;
          province: string | null;
          postal_code: string;
          country: string;
          is_default: boolean;
        };
        Insert: {
          address_id?: string;
          user_id: string;
          street_address: string;
          city: string;
          district?: string | null;
          province?: string | null;
          postal_code: string;
          country: string;
          is_default?: boolean;
        };
        Update: {
          address_id?: string;
          user_id?: string;
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
          payment_method_id: string;
          user_id: string;
          payment_type: string;
          card_number: string | null;
          expiry_date: string | null;
          card_holder_name: string | null;
          is_default: boolean;
        };
        Insert: {
          payment_method_id?: string;
          user_id: string;
          payment_type: string;
          card_number?: string | null;
          expiry_date?: string | null;
          card_holder_name?: string | null;
          is_default?: boolean;
        };
        Update: {
          payment_method_id?: string;
          user_id?: string;
          payment_type?: string;
          card_number?: string | null;
          expiry_date?: string | null;
          card_holder_name?: string | null;
          is_default?: boolean;
        };
      };
      categories: {
        Row: {
          category_id: string;
          name: string;
          description: string | null;
          image: string | null;
          is_active: boolean;
          display_order: number;
        };
        Insert: {
          category_id?: string;
          name: string;
          description?: string | null;
          image?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
        Update: {
          category_id?: string;
          name?: string;
          description?: string | null;
          image?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
      };
      subcategories: {
        Row: {
          subcategory_id: string;
          category_id: string;
          name: string;
          description: string | null;
          image: string | null;
          is_active: boolean;
          display_order: number;
        };
        Insert: {
          subcategory_id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          image?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
        Update: {
          subcategory_id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          image?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
      };
      sellers: {
        Row: {
          seller_id: string;
          name: string;
          description: string | null;
          contact_info: string;
          logo: string | null;
          is_verified: boolean;
          joined_date: string;
        };
        Insert: {
          seller_id?: string;
          name: string;
          description?: string | null;
          contact_info: string;
          logo?: string | null;
          is_verified?: boolean;
          joined_date?: string;
        };
        Update: {
          seller_id?: string;
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
          product_id: string;
          subcategory_id: string | null;
          seller_id: string;
          name: string;
          description: string | null;
          price: number;
          stock_quantity: number;
          discount_percentage: number | null;
          sku: string | null;
          is_active: boolean;
        };
        Insert: {
          product_id?: string;
          subcategory_id?: string | null;
          seller_id: string;
          name: string;
          description?: string | null;
          price: number;
          stock_quantity?: number;
          discount_percentage?: number | null;
          sku?: string | null;
          is_active?: boolean;
        };
        Update: {
          product_id?: string;
          subcategory_id?: string | null;
          seller_id?: string;
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
          image_id: string;
          product_id: string;
          image_url: string;
          is_primary: boolean;
          display_order: number;
        };
        Insert: {
          image_id?: string;
          product_id: string;
          image_url: string;
          is_primary?: boolean;
          display_order?: number;
        };
        Update: {
          image_id?: string;
          product_id?: string;
          image_url?: string;
          is_primary?: boolean;
          display_order?: number;
        };
      };
      carts: {
        Row: {
          cart_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          cart_id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          cart_id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          cart_item_id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          added_at: string;
        };
        Insert: {
          cart_item_id?: string;
          cart_id: string;
          product_id: string;
          quantity?: number;
          added_at?: string;
        };
        Update: {
          cart_item_id?: string;
          cart_id?: string;
          product_id?: string;
          quantity?: number;
          added_at?: string;
        };
      };
      orders: {
        Row: {
          order_id: string;
          user_id: string;
          order_number: string;
          total_amount: number;
          status: string;
          order_date: string;
        };
        Insert: {
          order_id?: string;
          user_id: string;
          order_number: string;
          total_amount: number;
          status?: string;
          order_date?: string;
        };
        Update: {
          order_id?: string;
          user_id?: string;
          order_number?: string;
          total_amount?: number;
          status?: string;
          order_date?: string;
        };
      };
      order_items: {
        Row: {
          order_item_id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Insert: {
          order_item_id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Update: {
          order_item_id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
        };
      };
      payments: {
        Row: {
          payment_id: string;
          order_id: string;
          amount: number;
          payment_method: string;
          transaction_id: string | null;
          status: string;
          payment_date: string;
        };
        Insert: {
          payment_id?: string;
          order_id: string;
          amount: number;
          payment_method: string;
          transaction_id?: string | null;
          status: string;
          payment_date?: string;
        };
        Update: {
          payment_id?: string;
          order_id?: string;
          amount?: number;
          payment_method?: string;
          transaction_id?: string | null;
          status?: string;
          payment_date?: string;
        };
      };
      shipping_info: {
        Row: {
          shipping_id: string;
          order_id: string;
          shipping_method: string;
          shipping_cost: number;
          tracking_number: string | null;
          status: string;
          estimated_delivery: string | null;
          actual_delivery: string | null;
        };
        Insert: {
          shipping_id?: string;
          order_id: string;
          shipping_method: string;
          shipping_cost: number;
          tracking_number?: string | null;
          status?: string;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
        };
        Update: {
          shipping_id?: string;
          order_id?: string;
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
          review_id: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          review_date: string;
          is_verified_purchase: boolean;
        };
        Insert: {
          review_id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          review_date?: string;
          is_verified_purchase?: boolean;
        };
        Update: {
          review_id?: string;
          product_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          review_date?: string;
          is_verified_purchase?: boolean;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
}; 