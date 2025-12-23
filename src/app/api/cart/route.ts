import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/services/supabase';

export async function POST(request: Request) {
    try {
        const supabase = await getSupabaseClient();

        const { product_id, quantity } = await request.json();

        // Validate request body
        if (!product_id || !quantity || quantity < 1) {
            return NextResponse.json(
                { error: 'Product ID and quantity are required' },
                { status: 400 }
            );
        }

        console.log('Adding product to cart:', {
            product_id,
            quantity,
            productIdType: typeof product_id,
            isNumeric: !isNaN(Number(product_id))
        });

        // Ensure product_id is a number
        const numericProductId = Number(product_id);
        if (isNaN(numericProductId)) {
            console.error('Invalid product_id format:', product_id);
            return NextResponse.json(
                { error: 'Product ID must be a number' },
                { status: 400 }
            );
        }

        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        let cart_id;

        if (session?.user) {
            // User is logged in, get their cart or create one
            const { data: existingCart } = await supabase
                .from('carts')
                .select('cart_id')
                .eq('user_id', session.user.id)
                .single();

            if (existingCart) {
                cart_id = existingCart.cart_id;
            } else {
                // Create a new cart for the user
                const { data: insertResult, error: insertError } = await supabase
                    .from('carts')
                    .insert({
                        user_id: session.user.id
                    })
                    .select('cart_id')
                    .single();

                if (insertError) {
                    console.error('Error creating user cart:', insertError);
                    throw new Error(insertError.message);
                }

                cart_id = insertResult?.cart_id;
                console.log('Created new user cart with ID:', cart_id);
            }
        } else {
            // Guest user - handle cart ID via service logic if possible or cookies
            // For now, let's keep it simple and use a cookie if session is missing
            // But ideally we'd use the service which handles this.
            // Actually, the current route logic for guests is complex.
            // Let's stick to using supabase client as desired.

            // Note: If we use getSupabaseClient(), it already handles cookies internally.
            // But the 'cart_id' cookie is custom for RoabH Mart guest carts.

            // I'll keep the custom cookie logic but use the factory supabase.
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const cartCookie = cookieStore.get('cart_id');
            cart_id = cartCookie?.value;

            if (!cart_id) {
                const GUEST_USER_ID = 9999;
                const { data: insertResult, error: insertError } = await supabase
                    .from('carts')
                    .insert({
                        user_id: GUEST_USER_ID
                    })
                    .select('cart_id')
                    .single();

                if (insertError) {
                    console.error('Error creating guest cart:', insertError);
                    throw new Error(insertError.message);
                }

                cart_id = insertResult.cart_id;


                cookieStore.set('cart_id', cart_id.toString(), {
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: '/'
                });
            }
        }


        const { data: product, error: productError } = await supabase
            .from('products')
            .select('product_id, stock_quantity')
            .eq('product_id', numericProductId)
            .single();

        if (productError || !product) {

            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (product.stock_quantity < quantity) {
            return NextResponse.json(
                { error: 'Not enough items in stock' },
                { status: 400 }
            );
        }

        // Check if the item is already in the cart
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('cart_item_id, quantity')
            .eq('cart_id', cart_id)
            .eq('product_id', numericProductId)
            .single();

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('cart_item_id', existingItem.cart_item_id);

            if (updateError) throw new Error(updateError.message);
        } else {
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert({
                    cart_id,
                    product_id: numericProductId,
                    quantity
                });

            if (insertError) {
                console.error('Error inserting cart item:', insertError);
                throw new Error(insertError.message);
            }
        }

        // Get updated cart count
        const { data: cartItems, error: countError } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('cart_id', cart_id);

        if (countError) throw new Error(countError.message);

        const totalItems = (cartItems as any[]).reduce((sum, item) => sum + item.quantity, 0);

        return NextResponse.json({
            success: true,
            message: 'Item added to cart',
            cart_id,
            total_items: totalItems
        });

    } catch (error) {

        return NextResponse.json(
            { error: 'Failed to add item to cart' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const supabase = await getSupabaseClient();
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();

        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        let cart_id;

        if (session?.user) {
            const { data: userCart } = await supabase
                .from('carts')
                .select('cart_id')
                .eq('user_id', session.user.id)
                .single();

            cart_id = userCart?.cart_id;
        } else {
            const cartCookie = cookieStore.get('cart_id');
            if (cartCookie?.value) {
                try {
                    cart_id = parseInt(cartCookie.value, 10);
                    if (isNaN(cart_id)) {
                        cart_id = null;
                    } else {
                        const { data: guestCart } = await supabase
                            .from('carts')
                            .select('cart_id')
                            .eq('cart_id', cart_id)
                            .single();
                        cart_id = guestCart?.cart_id;
                    }
                } catch (e) {
                    cart_id = null;
                }
            }
        }

        if (!cart_id) {
            return NextResponse.json({
                items: [],
                total_items: 0,
                total_price: 0
            });
        }

        const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select(`
                cart_item_id,
                quantity,
                products (
                  product_id,
                  name,
                  price,
                  stock_quantity,
                  product_images (
                    image_url,
                    is_primary
                  )
                )
            `)
            .eq('cart_id', cart_id);

        if (error) throw new Error(error.message);

        let totalItems = 0;
        let totalPrice = 0;

        const formattedItems = (cartItems as any[]).map((item) => {
            const product = item.products;
            totalItems += item.quantity;
            totalPrice += item.quantity * product.price;

            const primaryImage = product.product_images.find((img: any) => img.is_primary)?.image_url
                || product.product_images[0]?.image_url
                || null;

            return {
                cart_item_id: item.cart_item_id,
                product_id: product.product_id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                stock_quantity: product.stock_quantity,
                image: primaryImage,
                subtotal: item.quantity * product.price
            };
        });

        return NextResponse.json({
            items: formattedItems,
            total_items: totalItems,
            total_price: totalPrice
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch cart' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const supabase = await getSupabaseClient();
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();

        const { data: { session } } = await supabase.auth.getSession();
        let cart_id;

        if (session?.user) {
            const { data: userCart } = await supabase
                .from('carts')
                .select('cart_id')
                .eq('user_id', session.user.id)
                .single();

            cart_id = userCart?.cart_id;
        } else {
            const cartCookie = cookieStore.get('cart_id');
            if (cartCookie?.value) {
                cart_id = parseInt(cartCookie.value, 10);
            }
        }

        if (!cart_id) {
            return NextResponse.json({
                success: true,
                message: 'Cart is already empty'
            });
        }

        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart_id);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        return NextResponse.json({
            success: true,
            message: 'Cart cleared successfully'
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to clear cart' },
            { status: 500 }
        );
    }
}
