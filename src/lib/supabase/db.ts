import { createClient } from './server';
import { Product, Category, Order, CartItem, Subcategory, Review, User, UserProfile, Seller } from '@/types/supabase';

// Products
export const getProducts = async () => {
  const supabase = await createClient();
  return supabase
    .from('products')
    .select(`
      *,
      subcategory:subcategories(*),
      seller:sellers(*)
    `)
    .eq('is_active', true);
};

export const getProductById = async (productId: string) => {
  const supabase = await createClient();
  const productResponse = await supabase
    .from('products')
    .select(`
      *,
      subcategory:subcategories(*),
      seller:sellers(*)
    `)
    .eq('product_id', productId)
    .eq('is_active', true)
    .single();
    
  // If product found, get its images
  if (!productResponse.error && productResponse.data) {
    const imagesResponse = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false })
      .order('display_order', { ascending: true });
      
    if (!imagesResponse.error) {
      return {
        ...productResponse,
        data: {
          ...productResponse.data,
          images: imagesResponse.data || []
        }
      };
    }
  }
  
  return productResponse;
};

export const getProductsBySlug = async (slug: string) => {
  // Since slug isn't in the schema, this would require custom handling or a SQL function
  // For now, we'll get all products and filter by a custom slug field
  // In a real implementation, you might want to add a slug column or use a SQL function
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      subcategory:subcategories(*),
      seller:sellers(*)
    `)
    .eq('is_active', true);
  
  if (error) return { data: null, error };
  
  // Generate slug from product name and filter
  const product = products.find(p => {
    const productSlug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    return productSlug === slug;
  });
  
  if (!product) {
    return { data: null, error: { message: 'Product not found', status: 404 } };
  }
  
  // Get product images
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product.product_id)
    .order('is_primary', { ascending: false })
    .order('display_order', { ascending: true });
    
  return {
    data: {
      ...product,
      images: images || []
    },
    error: null
  };
};

export const getProductsByCategory = async (categoryId: string) => {
  const supabase = await createClient();
  return supabase
    .from('products')
    .select(`
      *,
      subcategory:subcategories!inner(*),
      seller:sellers(*)
    `)
    .eq('subcategory.category_id', categoryId)
    .eq('is_active', true);
};

export const getProductsBySubcategory = async (subcategoryId: string) => {
  const supabase = await createClient();
  return supabase
    .from('products')
    .select(`
      *,
      subcategory:subcategories(*),
      seller:sellers(*)
    `)
    .eq('subcategory_id', subcategoryId)
    .eq('is_active', true);
};

// Categories and Subcategories
export const getCategories = async () => {
  const supabase = await createClient();
  return supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
};

export const getSubcategories = async (categoryId?: string) => {
  const supabase = await createClient();
  let query = supabase
    .from('subcategories')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
    
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  return query;
};

// User profile and addresses
export const getUserProfile = async (userId: string) => {
  const supabase = await createClient();
  return supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
};

export const getUserAddresses = async (userId: string) => {
  const supabase = await createClient();
  return supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
};

export const saveUserAddress = async (address: any) => {
  const supabase = await createClient();
  
  // If setting as default, update all other addresses to not be default
  if (address.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', address.user_id);
  }
  
  // Insert or update address
  if (address.address_id) {
    return supabase
      .from('addresses')
      .update(address)
      .eq('address_id', address.address_id)
      .select();
  } else {
    return supabase.from('addresses').insert(address).select();
  }
};

// Orders
export const createOrder = async (orderData: {
  user_id: string;
  total_amount: number;
  items: { product_id: string; quantity: number; unit_price: number; subtotal: number; }[];
  shipping?: { shipping_method: string; shipping_cost: number; };
  payment?: { amount: number; payment_method: string; transaction_id?: string; status: string; };
}) => {
  const supabase = await createClient();
  
  // Generate a unique order number
  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Start a transaction
  // Note: Supabase doesn't support transactions in the client library, so we'll simulate it with sequential operations
  
  // 1. Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.user_id,
      order_number: orderNumber,
      total_amount: orderData.total_amount,
      status: 'pending',
      order_date: new Date().toISOString()
    })
    .select()
    .single();
  
  if (orderError || !order) {
    return { error: orderError || { message: 'Failed to create order' } };
  }
  
  // 2. Create order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  
  if (itemsError) {
    return { error: itemsError };
  }
  
  // 3. Create shipping info if provided
  if (orderData.shipping) {
    const { error: shippingError } = await supabase
      .from('shipping_info')
      .insert({
        order_id: order.order_id,
        shipping_method: orderData.shipping.shipping_method,
        shipping_cost: orderData.shipping.shipping_cost,
        status: 'processing'
      });
      
    if (shippingError) {
      return { error: shippingError };
    }
  }
  
  // 4. Create payment info if provided
  if (orderData.payment) {
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.order_id,
        amount: orderData.payment.amount,
        payment_method: orderData.payment.payment_method,
        transaction_id: orderData.payment.transaction_id,
        status: orderData.payment.status,
        payment_date: new Date().toISOString()
      });
      
    if (paymentError) {
      return { error: paymentError };
    }
  }
  
  // 5. Get the complete order with all related data
  return getOrderById(order.order_id);
};

export const getOrdersByUser = async (userId: string) => {
  const supabase = await createClient();
  return supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*, product:products(*)),
      shipping:shipping_info(*),
      payment:payments(*)
    `)
    .eq('user_id', userId)
    .order('order_date', { ascending: false });
};

export const getOrderById = async (orderId: string) => {
  const supabase = await createClient();
  return supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*, product:products(*)),
      shipping:shipping_info(*),
      payment:payments(*)
    `)
    .eq('order_id', orderId)
    .single();
};

// Cart
export const getUserCart = async (userId: string) => {
  const supabase = await createClient();
  
  // First, get or create the user's cart
  let { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (cartError && cartError.code === 'PGRST116') { // Record not found
    // Create a new cart
    const { data: newCart, error: newCartError } = await supabase
      .from('carts')
      .insert({
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (newCartError) {
      return { error: newCartError };
    }
    
    cart = newCart;
  } else if (cartError) {
    return { error: cartError };
  }
  
  // Now get the cart items
  const { data: cartItems, error: itemsError } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('cart_id', cart.cart_id);
  
  if (itemsError) {
    return { error: itemsError };
  }
  
  return {
    data: {
      ...cart,
      items: cartItems
    },
    error: null
  };
};

export const updateCartItem = async (cartId: string, productId: string, quantity: number) => {
  const supabase = await createClient();
  
  if (quantity <= 0) {
    // Remove the item if quantity is zero or less
    return supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
      .eq('product_id', productId);
  }
  
  // Check if the item exists
  const { data: existingItem, error: checkError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') { // Error other than "not found"
    return { error: checkError };
  }
  
  if (existingItem) {
    // Update existing item
    return supabase
      .from('cart_items')
      .update({ quantity })
      .eq('cart_item_id', existingItem.cart_item_id)
      .select();
  } else {
    // Insert new item
    return supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
        added_at: new Date().toISOString()
      })
      .select();
  }
};

export const clearCart = async (cartId: string) => {
  const supabase = await createClient();
  return supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);
};

// Reviews
export const getProductReviews = async (productId: string) => {
  const supabase = await createClient();
  return supabase
    .from('reviews')
    .select(`
      *,
      user:users(user_id, username)
    `)
    .eq('product_id', productId)
    .order('review_date', { ascending: false });
};

export const createReview = async (review: {
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  is_verified_purchase: boolean;
}) => {
  const supabase = await createClient();
  return supabase
    .from('reviews')
    .insert({
      ...review,
      review_date: new Date().toISOString()
    })
    .select();
}; 