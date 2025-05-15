import { notFound } from 'next/navigation';
import AddToCartButton from './AddToCartButton';
import ProductGallery from './ProductGallery';
import RelatedProducts from './RelatedProducts';

type ProductDetailPageProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
    const { id } = params;

    // In a real app, this would fetch from Supabase or an API
    // Mock product data
    const product = {
        id,
        name: 'Smart Watch Pro',
        description: 'The Smart Watch Pro is a premium wearable device that combines style with cutting-edge technology. Track your fitness goals, receive notifications, and monitor your health with this sleek and powerful smartwatch.',
        price: 199.99,
        images: [
            'https://placekitten.com/800/800',
            'https://placekitten.com/801/800',
            'https://placekitten.com/802/800',
        ],
        category: 'electronics',
        stock: 8,
        features: [
            'Heart rate monitoring',
            'Sleep tracking',
            'Water resistant up to 50m',
            'GPS tracking',
            '5-day battery life',
            'Customizable watch faces',
        ],
        specifications: {
            'Display': '1.4" AMOLED',
            'Connectivity': 'Bluetooth 5.0, WiFi',
            'Battery': 'Lithium-ion 300mAh',
            'Compatibility': 'iOS 12+, Android 8+',
            'Sensors': 'Accelerometer, Gyroscope, Heart Rate',
            'Dimensions': '44mm x 38mm x 10.7mm',
            'Weight': '48g',
        },
        createdAt: '2023-03-05',
        updatedAt: '2023-03-05',
    };

    // If product not found
    if (!product) {
        notFound();
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
                            {product.features.map((feature, index) => (
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