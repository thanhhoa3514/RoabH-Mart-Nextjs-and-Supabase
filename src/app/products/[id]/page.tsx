import { notFound } from 'next/navigation';
import AddToCartButton from './AddToCartButton';
import ProductGallery from './ProductGallery';
import RelatedProducts from './RelatedProducts';
import { getProductById } from '@/lib/supabase/products/products.model';

type ProductParams = {
  id: string;
};

type ProductDetailPageProps = {
  params: ProductParams;
  searchParams?: { [key: string]: string | string[] | undefined };
};

type ProductImage = {
  image_url: string;
  is_primary: boolean;
}

type ProductSpecifications = {
  [key: string]: string;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { id } = params;

    // Fetch product data from Supabase
    const { data: productData, error } = await getProductById(id);

    // If error or no product found
    if (error || !productData) {
        notFound();
    }

    // Format the product data to match the expected structure
    const product = {
        id: productData.product_id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        images: productData.product_images.map((img: ProductImage) => img.image_url),
        category: productData.subcategory_id, // This should ideally include category name
        stock: productData.stock_quantity,
        features: productData.features || [
            'Premium quality',
            'Durable construction',
            'Modern design',
            'Satisfaction guaranteed',
        ],
        specifications: productData.specifications as ProductSpecifications || {
            'Material': 'High-quality materials',
            'Dimensions': 'Standard size',
            'Weight': 'Average weight',
            'Warranty': '1 year manufacturer warranty',
        },
        createdAt: new Date(productData.created_at || Date.now()).toISOString().split('T')[0],
        updatedAt: new Date(productData.updated_at || Date.now()).toISOString().split('T')[0],
    };

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
                            {product.features.map((feature: string, index: number) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Specifications */}
                    <div>
                        <h2 className="text-xl font-bold mb-3">Specifications</h2>
                        <div className="border rounded-md overflow-hidden">
                            {Object.entries(product.specifications).map(([key, value], index) => (
                                <div
                                    key={key}
                                    className={`flex ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                        } p-3`}
                                >
                                    <span className="font-medium w-1/3">{key}</span>
                                    <span className="w-2/3">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div className="mt-16">
                <RelatedProducts category={product.category} currentProductId={product.id} />
            </div>
        </div>
    );
} 