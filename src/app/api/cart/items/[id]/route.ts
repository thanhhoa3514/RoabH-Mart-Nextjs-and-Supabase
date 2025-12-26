import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/services/supabase';
import { ResponseHelper } from '@/utils/api-response';

// Update cart item quantity
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: cartItemId } = await params;
        const { quantity } = await request.json();
        const supabase = await getSupabaseClient();

        // Validate request
        if (!cartItemId || quantity === undefined || quantity < 1) {
            return ResponseHelper.badRequest('Invalid request data');
        }

        // Get cart item to verify it exists and check product stock
        const { data: cartItem, error: fetchError } = await supabase
            .from('cart_items')
            .select(`
                cart_id,
                product_id,
                products (stock_quantity)
            `)
            .eq('cart_item_id', cartItemId)
            .single();

        // Casting to a specific type to avoid any
        const item = cartItem as {
            cart_id: number;
            product_id: number;
            products: { stock_quantity: number } | null;
        } | null;

        if (fetchError || !cartItem) {
            return ResponseHelper.notFound('Cart item not found');
        }

        // Check if quantity exceeds available stock
        if (!item?.products || item.products.stock_quantity < quantity) {
            return ResponseHelper.badRequest('Not enough items in stock', {
                available: item?.products?.stock_quantity || 0
            });
        }

        // Update cart item quantity
        const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('cart_item_id', cartItemId);

        if (updateError) {
            throw new Error(updateError.message);
        }

        // Get updated cart data
        const { data: cartItems, error: countError } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('cart_id', cartItem.cart_id);

        if (countError) throw new Error(countError.message);

        const totalItems = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

        return ResponseHelper.success({
            message: 'Cart item updated',
            quantity,
            total_items: totalItems
        });

    } catch (error) {
        console.error('Error updating cart item:', error);
        return ResponseHelper.internalServerError('Failed to update cart item', error);
    }
}

// Delete cart item
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: cartItemId } = await params;
        const supabase = await getSupabaseClient();

        if (!cartItemId) {
            return ResponseHelper.badRequest('Cart item ID is required');
        }

        // Get cart ID before deletion for total count update
        const { data: cartItem, error: fetchError } = await supabase
            .from('cart_items')
            .select('cart_id')
            .eq('cart_item_id', cartItemId)
            .single();

        if (fetchError) {
            // Item might already be deleted
            return ResponseHelper.success({
                message: 'Cart item not found or already deleted'
            });
        }

        // Delete the cart item
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_item_id', cartItemId);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        // Get updated cart total
        const { data: cartItems, error: countError } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('cart_id', cartItem.cart_id);

        if (countError) throw new Error(countError.message);

        const totalItems = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

        return ResponseHelper.success({
            message: 'Cart item removed',
            total_items: totalItems
        });

    } catch (error) {
        console.error('Error removing cart item:', error);
        return ResponseHelper.internalServerError('Failed to remove cart item', error);
    }
}
