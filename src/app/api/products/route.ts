import { addProductImage } from '@/services/supabase/products/product.service';
import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/services/supabase';
import { ResponseHelper } from '@/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const excludeId = searchParams.get('exclude');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 4;

    // Get products
    const { data, error, count, totalPages } = await getProducts({
      categoryId: category || undefined,
      subcategoryId: subcategory || undefined,
      search: search || undefined,
      sort: (sort || 'newest') as string,
      page: page,
      limit: limit,
    });

    if (error) {
      return ResponseHelper.internalServerError('Failed to fetch products', error);
    }

    // If there's an exclude ID, filter out that product
    let filteredData = data;
    if (excludeId && data) {
      const numericExcludeId = parseInt(excludeId, 10);
      filteredData = data.filter(product => product.id !== numericExcludeId);

      // If we need to maintain the limit after filtering
      if (filteredData.length < limit) {
        // We could fetch more products here if needed
      }
    }

    // Calculate pagination metadata
    const pagination = ResponseHelper.calculatePagination(page, limit, count || 0);

    return ResponseHelper.success(filteredData, 200, { pagination });
  } catch (error) {
    return ResponseHelper.internalServerError('Internal server error', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get product data from request body
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.price || !data.description || !data.subcategory_id || !data.seller_id) {
      return ResponseHelper.badRequest('Required fields are missing');
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
      return ResponseHelper.internalServerError('Failed to add product', error);
    }

    if (!productResult || productResult.length === 0) {
      return ResponseHelper.internalServerError('Product was created but no data was returned');
    }

    // If there's an image, add it to product_images
    if (data.image) {
      const { error: imageError } = await addProductImage({
        product_id: productResult[0].product_id,
        image_url: data.image,
        is_primary: true,
        display_order: 0
      });

      if (imageError) {

        // Continue even if image upload fails
      }
    }

    return ResponseHelper.created({
      ...productResult[0],
      message: 'Product added successfully'
    });
  } catch (error) {
    return ResponseHelper.internalServerError('Internal server error', error);
  }
} 
