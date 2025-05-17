import { createProduct, addProductImage } from '@/lib/supabase/products/products.model';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getProducts } from '@/lib/supabase/products/client/product.query';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const excludeId = searchParams.get('exclude');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 4;
    
    // Get products
    const { data, error, count } = await getProducts({
      category,
      limit
    });
    
    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    // If there's an exclude ID, filter out that product
    let filteredData = data;
    if (excludeId && data) {
      filteredData = data.filter(product => product.id !== excludeId);
      
      // If we need to maintain the limit after filtering
      if (filteredData.length < limit) {
        // We could fetch more products here if needed
      }
    }
    
    return NextResponse.json({
      success: true,
      data: filteredData,
      count: count
    });
    
  } catch (error) {
    console.error('Error in GET products API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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