import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface Category {
    category_id: number;
    name: string;
    image: string | null;
}

interface CategoriesProps {
    categories: Category[];
}

export default function Categories({ categories }: CategoriesProps) {
    return (
        <section className="mb-16">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
                <p className="text-muted-foreground mt-2">Browse our wide range of categories</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length === 0 ? (
                    <div className="col-span-3 text-center py-12">
                        <p className="text-muted-foreground">No categories available</p>
                    </div>
                ) : (
                    categories.map((category) => (
                        <Link
                            key={category.category_id}
                            href={`/products?category=${category.name.toLowerCase()}`}
                            className="group"
                        >
                            <Card className="relative h-72 overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
                                <Image
                                    src={category.image || "https://placekitten.com/400/300"}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                <div className="absolute inset-0 flex items-end p-6">
                                    <div className="w-full">
                                        <h3 className="text-white text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                            {category.name}
                                        </h3>
                                        <div className="flex items-center text-white/90 text-sm">
                                            <span>Explore Collection</span>
                                            <svg
                                                className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </section>
    );
}
