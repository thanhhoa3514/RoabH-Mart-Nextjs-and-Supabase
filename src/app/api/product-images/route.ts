import { NextRequest, NextResponse } from 'next/server';
import { addProductImage } from '@/lib/supabase/products/product.service';

export async function POST(request: NextRequest) {
    try {
        // Get image data from request body
        const data = await request.json();

        // Validate required fields
        if (!data.product_id || !data.image_url) {
            return NextResponse.json(
                { error: 'Product ID and image URL are required' },
                { status: 400 }
            );
        }

        // Add image to product in database
        const { error } = await addProductImage(
            data.product_id,
            data.image_url,
            data.is_primary || false
        );

        if (error) {
            console.error('Error adding product image:', error);
            return NextResponse.json(
                { error: 'Failed to add product image' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Product image added successfully'
        });

    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 
