'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AddToCartButton from './AddToCartButton';
import ProductGallery from './ProductGallery';
import RelatedProducts from './RelatedProducts';
import ProductReviews from '@/components/products/ProductReviews';
import ReviewForm from '@/components/products/ReviewForm';
import { getProductById } from '@/lib/supabase';
import { Product as BaseProduct } from '@/types';

type ProductImage = {
  image_url: string;
  is_primary: boolean;
}

type ProductSpecifications = {
  [key: string]: string;
}

// Extend the base Product interface with additional properties needed in this component
interface ProductWithDetails extends BaseProduct {
  features: string[];
  specifications: ProductSpecifications;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewsKey, setReviewsKey] = useState(0); // Used to force refresh reviews component

  // Fetch product data
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const productId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
        
        if (!productId) {
          throw new Error('Invalid product ID');
        }
        
        const { data, error } = await getProductById(productId);
        
        if (error || !data) {
          throw error || new Error('Product not found');
        }
        
        // Format the product data
        const formattedProduct: ProductWithDetails = {
          id: data.product_id.toString(),
          name: data.name,
          description: data.description,
          price: data.price,
          images: data.product_images?.map((img: ProductImage) => img.image_url) || [],
          category: data.subcategory_id.toString(),
          stock: data.stock_quantity,
          features: data.features || [
              'Premium quality',
              'Durable construction',
              'Modern design',
              'Satisfaction guaranteed',
          ],
          specifications: data.specifications as ProductSpecifications || {
              'Material': 'High-quality materials',
              'Dimensions': 'Standard size',
              'Weight': 'Average weight',
              'Warranty': '1 year manufacturer warranty',
          },
          createdAt: new Date(data.created_at || Date.now()).toISOString().split('T')[0],
          updatedAt: new Date(data.updated_at || Date.now()).toISOString().split('T')[0],
        };
        
        setProduct(formattedProduct);
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    
    loadProduct();
  }, [id]);

  // Handle review submission
  const handleReviewSubmitted = () => {
    // Force refresh reviews component
    setReviewsKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <div className="w-full aspect-square bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="h-10 w-2/3 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-500">Error loading product: {error || 'Product not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Images */}
        <div className="w-full md:w-1/2">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-primary font-bold mb-4">${product.price.toFixed(2)}</p>

          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-green-600">In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Add to Cart */}
          <div className="mb-8">
            <AddToCartButton product={product} />
          </div>

          {/* Features */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Features</h2>
            <ul className="list-disc pl-5 space-y-1">
              {product.features?.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-xl font-bold mb-3">Specifications</h2>
            <div className="border rounded-md overflow-hidden">
              {Object.entries(product.specifications || {}).map(([key, value], index) => (
                <div
                  key={key}
                  className={`flex ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } p-3`}
                >
                  <span className="font-medium w-1/3">{key}</span>
                  <span className="w-2/3">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t pt-8">
        <ProductReviews key={reviewsKey} productId={parseInt(product.id)} />
        <ReviewForm productId={parseInt(product.id)} onReviewSubmitted={handleReviewSubmitted} />
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <RelatedProducts category={product.category} currentProductId={product.id} />
      </div>
    </div>
  );
} 