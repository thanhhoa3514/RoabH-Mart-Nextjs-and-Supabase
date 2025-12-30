'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, Truck, Package, ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import ProductReviews from '@/components/products/ProductReviews';
import RelatedProducts from '@/components/products/RelatedProducts';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useCart } from '@/providers/cart-provider';
import { useAlert } from '@/providers/alert-provider';
import { Product } from '@/types/supabase';

interface ExtendedProduct extends Omit<Product, 'images'> {
  images: string[];
  category?: string;
  rating?: number;
  reviews_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductPage() {
  const params = useParams();
  const productId = Number(params.id);
  const { showAlert } = useAlert();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);

        // Check if response is OK
        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }

        // Get response text first to check if it's valid
        const text = await res.text();

        // Parse JSON safely
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          console.error('Invalid JSON response:', text);
          throw new Error('Invalid response format from server');
        }

        if (data.error) {
          throw new Error(data.error);
        }

        if (!data.data) {
          throw new Error('Product data not found in response');
        }

        setProduct(data.data);
        // Set the first image as selected by default
        if (data.data.images && data.data.images.length > 0) {
          setSelectedImage(data.data.images[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        showAlert('error', `Failed to load product details: ${error instanceof Error ? error.message : 'Unknown error'}`, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, showAlert]);

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.product_id, quantity);
      showAlert('success', `${quantity} ${product.name} added to your cart`, 2000);
    } catch {
      console.error('Error adding to cart');
      // Alert is already shown by the cart context
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3 mt-8"></div>
              <div className="space-y-2 mt-6">
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: product.category || 'Products', href: `/categories/${encodeURIComponent(product.category || '')}` },
          { label: product.name, href: `/products/${product.product_id || product.id}` },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Product Images */}
        <div>
          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-4">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((image: string, index: number) => (
              <div
                key={index}
                className={`aspect-square relative rounded-md overflow-hidden cursor-pointer 
                          ${selectedImage === image ? 'ring-2 ring-amber-500' : 'opacity-70 hover:opacity-100'}`}
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image}
                  alt={`${product.name} - Thumbnail ${index + 1}`}
                  fill
                  sizes="10vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

          <div className="flex items-center mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= (product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">
              {product.rating ? `${product.rating.toFixed(1)} (${product.reviews_count || 0} reviews)` : 'No ratings yet'}
            </span>
          </div>

          <div className="mt-4">
            <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            {(product.discount_percentage ?? 0) > 0 && (
              <div className="mt-1">
                <span className="text-gray-500 line-through mr-2">
                  ${(product.price / (1 - (product.discount_percentage || 0) / 100)).toFixed(2)}
                </span>
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                  {product.discount_percentage}% OFF
                </span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center text-sm">
              <Truck className="h-5 w-5 text-gray-400 mr-2" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center text-sm">
              <Package className="h-5 w-5 text-gray-400 mr-2" />
              <span>Available for immediate shipping</span>
            </div>
          </div>

          {isOutOfStock ? (
            <div className="mt-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 font-medium">Out of Stock</p>
                <p className="text-gray-500 text-sm mt-1">This product is currently unavailable.</p>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <label htmlFor="quantity" className="mr-4 text-gray-700">Quantity:</label>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={handleDecrement}
                    className="px-3 py-2 border-r hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="px-3 py-2 border-l hover:bg-gray-100"
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="ml-4 text-sm text-gray-500">
                  {product.stock_quantity} available
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-md flex items-center justify-center transition-colors"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Reviews */}
      <ProductReviews productId={product.product_id} />

      {/* Related Products */}
      <RelatedProducts
        category={product.category}
        currentProductId={product.product_id}
      />
    </div>
  );
} 