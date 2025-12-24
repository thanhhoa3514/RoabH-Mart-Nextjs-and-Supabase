import { getFeaturedProducts } from '@/services/supabase/products/product.service';
import { getCategoriesWithImages } from '@/services/supabase/categories/category.service';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Categories from '@/components/home/Categories';
import Newsletter from '@/components/home/Newsletter';

export default async function Home() {
  // Fetch featured products from Supabase
  const { data: featuredProductsData, error: featuredProductsError } = await getFeaturedProducts(4);

  // Fetch categories from Supabase with full image URLs
  const { data: categoriesData, error: categoriesError } = await getCategoriesWithImages();

  // Fallback data in case of errors
  const featuredProducts = featuredProductsError ? [] : featuredProductsData || [];
  const categories = categoriesError ? [] : categoriesData || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <FeaturedProducts products={featuredProducts} />

      {/* Categories */}
      <Categories categories={categories} />

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
