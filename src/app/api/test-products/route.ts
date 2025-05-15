import { NextResponse } from 'next/server';
import { getProducts, getProductById } from '@/lib/supabase/products/client/product.query';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    // If ID is provided, get a single product
    if (productId) {
      const { data, error } = await getProductById(productId);
      
      if (error) {
        return NextResponse.json(
          { error: `Error fetching product with ID ${productId}: ${error}` },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ success: true, product: data });
    }
    
    // Otherwise, get a list of products with params
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory_id') 
      ? parseInt(searchParams.get('subcategory_id')!) 
      : undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    
    const { data, error, count, totalPages } = await getProducts({
      category,
      subcategory_id: subcategory,
      search,
      sort,
      page,
      limit
    });
    
    if (error) {
      return NextResponse.json(
        { error: `Error fetching products: ${JSON.stringify(error)}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      products: data,
      pagination: {
        count,
        page,
        totalPages,
        limit
      }
    });
  } catch (err) {
    console.error('Unexpected error in test-products API route:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 