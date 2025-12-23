import { ResponseHelper } from '@/utils/api-response';
import { getSupabaseClient } from '../client.factory';

export const getUserCart = async (userId: string) => {
    const supabase = await getSupabaseClient();

    // First, get or create the user's cart
    const { data: initialCart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .single();

    let cart = initialCart;

    if (cartError && cartError.code === 'PGRST116') { // Record not found
        const { data: newCart, error: newCartError } = await supabase
            .from('carts')
            .insert({
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (newCartError) return { error: newCartError };
        cart = newCart;
    } else if (cartError) {
        return { error: cartError };
    }

    if (!cart) {
        return { error: { message: 'Cart not found and could not be created' } };
    }

    // Now get the cart items
    const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
      *,
      product:products(*)
    `)
        .eq('cart_id', cart.cart_id);

    if (itemsError) return { error: itemsError };

    return ResponseHelper.success({
        cart,
        cartItems
    });
};

export const updateCartItem = async (cartId: string, productId: string, quantity: number) => {
    const supabase = await getSupabaseClient();

    if (quantity <= 0) {
        return supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cartId)
            .eq('product_id', productId);
    }

    const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single();

    if (checkError && checkError.code !== 'PGRST116') return { error: checkError };

    if (existingItem) {
        return supabase
            .from('cart_items')
            .update({ quantity })
            .eq('cart_item_id', existingItem.cart_item_id)
            .select();
    } else {
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
    const supabase = await getSupabaseClient();
    return supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);
};
