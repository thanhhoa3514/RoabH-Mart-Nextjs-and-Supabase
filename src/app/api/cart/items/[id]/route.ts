import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Update cart item quantity
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cartItemId = params.id;
        const { quantity } = await request.json();

        // Validate request
        if (!cartItemId || quantity === undefined || quantity < 1) {
            return NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 }
            );
        }

        // Create Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

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

        if (fetchError || !cartItem) {
            return NextResponse.json(
                { error: 'Cart item not found' },
                { status: 404 }
            );
        }

        // Check if quantity exceeds available stock
        if ((cartItem.products as any).stock_quantity < quantity) {
            return NextResponse.json(
                { error: 'Not enough items in stock', available: (cartItem.products as any).stock_quantity },
                { status: 400 }
            );
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

        return NextResponse.json({
            success: true,
            message: 'Cart item updated',
            quantity,
            total_items: totalItems
        });

    } catch (error) {
        console.error('Error updating cart item:', error);
        return NextResponse.json(
            { error: 'Failed to update cart item' },
            { status: 500 }
        );
    }
}

// Delete cart item
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cartItemId = params.id;

        if (!cartItemId) {
            return NextResponse.json(
                { error: 'Cart item ID is required' },
                { status: 400 }
            );
        }

        // Create Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get cart ID before deletion for total count update
        const { data: cartItem, error: fetchError } = await supabase
            .from('cart_items')
            .select('cart_id')
            .eq('cart_item_id', cartItemId)
            .single();

        if (fetchError) {
            // Item might already be deleted
            return NextResponse.json({
                success: true,
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

        return NextResponse.json({
            success: true,
            message: 'Cart item removed',
            total_items: totalItems
        });

    } catch (error) {
        console.error('Error removing cart item:', error);
        return NextResponse.json(
            { error: 'Failed to remove cart item' },
            { status: 500 }
        );
    }
} 