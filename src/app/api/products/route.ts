import { createProduct, addProductImage } from '@/lib/supabase/products/products.model';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get product data from request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.price || !data.description || !data.subcategory_id || !data.seller_id) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Prepare product data for insertion
    const productData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      stock_quantity: parseInt(data.stock || '0', 10),
      subcategory_id: data.subcategory_id,
      seller_id: data.seller_id,
      is_active: data.status !== 'Out of Stock',
      discount_percentage: data.discount_percentage || 0,
      sku: data.sku || `SKU-${Date.now()}`
    };

    // Insert product into database
    const { data: productResult, error } = await createProduct(productData);

    if (error) {
      console.error('Error adding product:', error);
      return NextResponse.json(
        { error: 'Failed to add product' },
        { status: 500 }
      );
    }

    if (!productResult || productResult.length === 0) {
      return NextResponse.json(
        { error: 'Product was created but no data was returned' },
        { status: 500 }
      );
    }

    // If there's an image, add it to product_images
    if (data.image) {
      const { error: imageError } = await addProductImage(
        productResult[0].product_id,
        data.image,
        true // Set as primary image
      );

      if (imageError) {
        console.error('Error adding product image:', imageError);
        // Continue even if image upload fails
      }
    }

    return NextResponse.json({
      success: true,
      data: productResult[0],
      message: 'Product added successfully'
    });
    
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 