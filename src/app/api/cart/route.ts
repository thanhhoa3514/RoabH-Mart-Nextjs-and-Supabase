import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) {
                        const cookie = cookieStore.get(name);
                        return cookie?.value;
                    },
                    set(name, value, options) {
                        cookieStore.set(name, value, options);
                    },
                    remove(name, options) {
                        cookieStore.set(name, '', { ...options, maxAge: 0 });
                    }
                }
            }
        );
        
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
                // Create a new cart for the user - using rpc to avoid UUID generation
                try {
                    // Call a raw SQL query to insert a row and get the serial id back
                    const { data: newCart, error: cartError } = await supabase
                        .rpc('create_user_cart', { 
                            user_id_param: session.user.id 
                        });

                    if (cartError) {
                        // If the function doesn't exist, we'll get a specific error
                        if (cartError.message && cartError.message.includes('function') && cartError.message.includes('does not exist')) {
                            // Function doesn't exist, throw specific error to catch block
                            throw new Error('Function not found');
                        }
                        
                        console.error('Error creating user cart via RPC:', cartError);
                        throw new Error(cartError.message);
                    }
                    
                    if (!newCart || !newCart.cart_id) {
                        console.error('No cart data returned after user cart creation');
                        throw new Error('Failed to create user cart');
                    }
                    
                    // Get the auto-generated cart_id
                    cart_id = newCart.cart_id;
                    console.log('Created new user cart with ID:', cart_id);
                } catch (e) {
                    console.error('Failed to create cart using RPC, trying direct insert:', e);
                    
                    // Fallback to direct insert without specifying the cart_id
                    const { data: insertResult, error: insertError } = await supabase
                        .from('carts')
                        .insert({ 
                            user_id: session.user.id 
                        })
                        .select('cart_id')
                        .single();
                        
                    if (insertError) {
                        console.error('Error with direct cart insert:', insertError);
                        throw new Error(insertError.message);
                    }
                    
                    cart_id = insertResult?.cart_id;
                    console.log('Created cart with direct insert, ID:', cart_id);
                }
            }
        } else {
            // Guest user - use cookie-based cart
            const cartCookie = cookieStore.get('cart_id');
            cart_id = cartCookie?.value;

            if (!cart_id) {
                // Use special guest user ID since user_id is NOT NULL in schema
                const GUEST_USER_ID = 9999; // Use a dedicated ID for guest users
                
                try {
                    // Direct insert without specifying the cart_id
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
                    
                    if (!insertResult) {
                        console.error('No cart data returned after guest cart creation');
                        throw new Error('Failed to create guest cart');
                    }
                    
                    cart_id = insertResult.cart_id;
                    console.log('Created guest cart with ID:', cart_id);
                    
                    // Set cookie to track anonymous cart (convert to string for cookie)
                    cookieStore.set('cart_id', cart_id.toString(), {
                        maxAge: 60 * 60 * 24 * 30, // 30 days
                        path: '/'
                    });
                } catch (e) {
                    console.error('Failed to create guest cart:', e);
                    throw new Error('Failed to create guest cart');
                }
            }
        }

        // Check if product exists and has enough stock
        console.log('Looking up product:', numericProductId);
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('product_id, stock_quantity')
            .eq('product_id', numericProductId)
            .single();

        if (productError || !product) {
            console.error('Product not found error:', productError);
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
            // Update quantity of existing item
            const newQuantity = existingItem.quantity + quantity;
            console.log('Updating existing cart item quantity:', existingItem.cart_item_id, 'from', existingItem.quantity, 'to', newQuantity);

            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('cart_item_id', existingItem.cart_item_id);

            if (updateError) throw new Error(updateError.message);
        } else {
            // Add new item to cart
            console.log('Adding new item to cart:', cart_id, numericProductId, quantity);
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

        const totalItems = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

        return NextResponse.json({
            success: true,
            message: 'Item added to cart',
            cart_id,
            total_items: totalItems
        });

    } catch (error) {
        console.error('Error adding to cart:', error);
        return NextResponse.json(
            { error: 'Failed to add item to cart' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) {
                        const cookie = cookieStore.get(name);
                        return cookie?.value;
                    },
                    set(name, value, options) {
                        cookieStore.set(name, value, options);
                    },
                    remove(name, options) {
                        cookieStore.set(name, '', { ...options, maxAge: 0 });
                    }
                }
            }
        );

        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        let cart_id;

        if (session?.user) {
            // Get user's cart
            const { data: userCart } = await supabase
                .from('carts')
                .select('cart_id')
                .eq('user_id', session.user.id)
                .single();

            cart_id = userCart?.cart_id;
        } else {
            // Get guest cart from cookie
            const cartCookie = cookieStore.get('cart_id');
            
            if (cartCookie?.value) {
                try {
                    // Parse cart_id as number since it's stored as SERIAL in the database
                    cart_id = parseInt(cartCookie.value, 10);
                    
                    if (isNaN(cart_id)) {
                        console.error('Invalid cart_id in cookie:', cartCookie.value);
                        cart_id = null;
                    } else {
                        // Verify this cart exists in database
                        const { data: guestCart, error: guestCartError } = await supabase
                            .from('carts')
                            .select('cart_id')
                            .eq('cart_id', cart_id)
                            .single();
                        
                        if (guestCartError) {
                            console.error('Error finding guest cart:', guestCartError);
                            cart_id = null; // Reset cart_id if not found
                        } else {
                            // Use the found cart_id
                            cart_id = guestCart?.cart_id;
                        }
                    }
                } catch (e) {
                    console.error('Error processing cart cookie:', e);
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

        // Get cart items with product details
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

        // Calculate totals
        let totalItems = 0;
        let totalPrice = 0;

        const formattedItems = cartItems.map((item: any) => {
            const product = item.products;
            totalItems += item.quantity;
            totalPrice += item.quantity * product.price;

            // Find primary image or use first available
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
        console.error('Error fetching cart:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cart' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) {
                        const cookie = cookieStore.get(name);
                        return cookie?.value;
                    },
                    set(name, value, options) {
                        cookieStore.set(name, value, options);
                    },
                    remove(name, options) {
                        cookieStore.set(name, '', { ...options, maxAge: 0 });
                    }
                }
            }
        );

        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        let cart_id;

        if (session?.user) {
            // Get user's cart
            const { data: userCart } = await supabase
                .from('carts')
                .select('cart_id')
                .eq('user_id', session.user.id)
                .single();

            cart_id = userCart?.cart_id;
        } else {
            // Get guest cart from cookie
            const cartCookie = cookieStore.get('cart_id');
            
            if (cartCookie?.value) {
                try {
                    // Parse cart_id as number since it's stored as SERIAL in the database
                    cart_id = parseInt(cartCookie.value, 10);
                    
                    if (isNaN(cart_id)) {
                        console.error('Invalid cart_id in cookie:', cartCookie.value);
                        cart_id = null;
                    }
                } catch (e) {
                    console.error('Error processing cart cookie:', e);
                    cart_id = null;
                }
            }
        }

        if (!cart_id) {
            return NextResponse.json({
                success: true,
                message: 'Cart is already empty'
            });
        }

        // Delete all cart items for this cart
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart_id);

        if (deleteError) {
            console.error('Error clearing cart:', deleteError);
            throw new Error(deleteError.message);
        }

        return NextResponse.json({
            success: true,
            message: 'Cart cleared successfully'
        });

    } catch (error) {
        console.error('Error clearing cart:', error);
        return NextResponse.json(
            { error: 'Failed to clear cart' },
            { status: 500 }
        );
    }
} 