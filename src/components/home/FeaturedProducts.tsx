import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ProductImage {
    image_url: string;
    is_primary: boolean;
}

interface Product {
    product_id: number;
    name: string;
    price: number;
    discount_percentage: number | null;
    product_images?: ProductImage[];
}

interface FeaturedProductsProps {
    products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
    return (
        <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
                    <p className="text-muted-foreground mt-2">Discover our handpicked selection</p>
                </div>
                <Button asChild variant="ghost" className="group">
                    <Link href="/products">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-4 text-center py-12">
                        <p className="text-muted-foreground">No featured products available</p>
                    </div>
                ) : (
                    products.map((product) => {
                        const primaryImage = product.product_images?.find((img: ProductImage) => img.is_primary)?.image_url;
                        const firstImage = product.product_images?.[0]?.image_url;
                        const imageUrl = primaryImage || firstImage || "https://placekitten.com/300/300";

                        return (
                            <Link
                                key={product.product_id}
                                href={`/products/${product.product_id}`}
                                className="group"
                            >
                                <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
                                    <CardContent className="p-0">
                                        <div className="relative h-64 overflow-hidden bg-muted">
                                            <Image
                                                src={imageUrl}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            {(product.discount_percentage ?? 0) > 0 && (
                                                <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
                                                    {product.discount_percentage}% OFF
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <p className="text-2xl font-bold text-primary">
                                                    ${product.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })
                )}
            </div>
        </section>
    );
}
