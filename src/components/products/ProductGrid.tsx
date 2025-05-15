import Link from 'next/link';
import Image from 'next/image';

// Define interface for database product
interface DbProduct {
  product_id: number;
  name: string;
  description?: string;
  price: string | number;
  discount_percentage?: number;
  stock_quantity?: number;
  product_images?: ProductImage[];
  is_active?: boolean;
}

// Define interface for product image
interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  display_order?: number;
}

interface ProductGridProps {
  products: DbProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        // Find primary image or first image
        const primaryImage = product.product_images?.find((img: ProductImage) => img.is_primary)?.image_url;
        const firstImage = product.product_images?.[0]?.image_url;
        const imageUrl = primaryImage || firstImage || "https://placekitten.com/300/300";
        
        return (
          <Link 
            key={product.product_id} 
            href={`/products/${product.product_id}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-[1.02]">
              <div className="relative h-48">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-primary font-bold">${parseFloat(product.price.toString()).toFixed(2)}</p>
                  {product.discount_percentage && product.discount_percentage > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                      {product.discount_percentage}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
} 