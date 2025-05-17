import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client/client.model';
import { updateProduct, getProductById, removeAllProductImages } from '@/lib/supabase/products/products.model';

type Context = {
  params: {
    id: string;
  };
};

export async function DELETE(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    const productId = context.params.id;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: product, error: productError } = await getProductById(productId);
    
    if (productError) {
      return NextResponse.json(
        { error: `Error checking product: ${productError.message}` },
        { status: 500 }
      );
    }
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete related cart items first
    const { error: cartItemsError } = await supabase
      .from('cart_items')
      .delete()
      .eq('product_id', productId);
      
    if (cartItemsError) {
      console.error('Error deleting cart items:', cartItemsError);
      return NextResponse.json(
        { error: `Failed to delete product from carts: ${cartItemsError.message}` },
        { status: 500 }
      );
    }
    
    // Delete related reviews
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .eq('product_id', productId);
      
    if (reviewsError) {
      console.error('Error deleting reviews:', reviewsError);
      return NextResponse.json(
        { error: `Failed to delete product reviews: ${reviewsError.message}` },
        { status: 500 }
      );
    }
    
    // Check if product is in any orders
    const { data: orderItems, error: orderItemsCheckError } = await supabase
      .from('order_items')
      .select('order_item_id')
      .eq('product_id', productId)
      .limit(1);
      
    if (orderItemsCheckError) {
      console.error('Error checking order items:', orderItemsCheckError);
      return NextResponse.json(
        { error: `Failed to check if product is in orders: ${orderItemsCheckError.message}` },
        { status: 500 }
      );
    }
    
    // If product is in orders, don't delete it but mark as inactive instead
    if (orderItems && orderItems.length > 0) {
      const { error: updateError } = await updateProduct(productId, { is_active: false });
      
      if (updateError) {
        return NextResponse.json(
          { error: `Failed to mark product as inactive: ${updateError.message}` },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Product has been marked inactive as it exists in orders',
        wasDeactivated: true
      });
    }

    // Delete product images
    const { error: imagesError } = await removeAllProductImages(productId);

    if (imagesError) {
      console.error('Error deleting product images:', imagesError);
      return NextResponse.json(
        { error: `Failed to delete product images: ${imagesError.message}` },
        { status: 500 }
      );
    }

    // Delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete product: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE product API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    const productId = context.params.id;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Parse the request body
    const requestBody = await request.json();

    // Validate required fields
    if (!requestBody.name || requestBody.name.trim() === '') {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (typeof requestBody.price !== 'undefined' && (isNaN(Number(requestBody.price)) || Number(requestBody.price) < 0)) {
      return NextResponse.json(
        { error: 'Price must be a valid number greater than or equal to 0' },
        { status: 400 }
      );
    }

    if (typeof requestBody.stock_quantity !== 'undefined' && (isNaN(Number(requestBody.stock_quantity)) || Number(requestBody.stock_quantity) < 0)) {
      return NextResponse.json(
        { error: 'Stock quantity must be a valid number greater than or equal to 0' },
        { status: 400 }
      );
    }

    // Prepare the product data for update
    const productData = {
      name: requestBody.name,
      description: requestBody.description,
      price: requestBody.price !== undefined ? Number(requestBody.price) : undefined,
      stock_quantity: requestBody.stock_quantity !== undefined ? Number(requestBody.stock_quantity) : undefined,
      subcategory_id: requestBody.subcategory_id,
      discount_percentage: requestBody.discount_percentage !== undefined ? Number(requestBody.discount_percentage) : undefined,
      is_active: requestBody.is_active,
      sku: requestBody.sku
    };

    // Update the product
    const { data, error } = await updateProduct(productId, productData);

    if (error) {
      return NextResponse.json(
        { error: `Failed to update product: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data
    });
  } catch (error) {
    console.error('Error in PUT product API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}