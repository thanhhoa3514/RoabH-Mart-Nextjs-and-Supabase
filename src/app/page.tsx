import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  // Mock data for featured products
  const featuredProducts = [
    {
      id: '1',
      name: 'Wireless Earbuds',
      price: 79.99,
      image: 'https://placekitten.com/300/300',
      category: 'electronics'
    },
    {
      id: '2',
      name: 'Cotton T-Shirt',
      price: 24.99,
      image: 'https://placekitten.com/301/300',
      category: 'clothing'
    },
    {
      id: '3',
      name: 'Smart Watch',
      price: 199.99,
      image: 'https://placekitten.com/302/300',
      category: 'electronics'
    },
    {
      id: '4',
      name: 'Kitchen Blender',
      price: 89.99,
      image: 'https://placekitten.com/303/300',
      category: 'home'
    },
  ];

  // Categories
  const categories = [
    {
      name: 'Electronics',
      image: 'https://placekitten.com/400/300',
      slug: 'electronics'
    },
    {
      name: 'Clothing',
      image: 'https://placekitten.com/401/300',
      slug: 'clothing'
    },
    {
      name: 'Home & Garden',
      image: 'https://placekitten.com/402/300',
      slug: 'home'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative h-[500px] rounded-xl overflow-hidden mb-12">
        <Image
          src="https://placekitten.com/1200/500"
          alt="RoabH Mart Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Welcome to RoabH Mart</h1>
          <p className="text-xl md:text-2xl mb-8 text-center max-w-2xl">
            Your one-stop destination for all your shopping needs
          </p>
          <Link 
            href="/products" 
            className="bg-primary hover:bg-opacity-90 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link 
            href="/products" 
            className="text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-[1.02]">
                <div className="relative h-64">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                  <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.slug} 
              href={`/products?category=${category.slug}`}
              className="group"
            >
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-secondary rounded-xl p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600">Stay updated with our latest offers and products</p>
          </div>
          <div className="w-full md:w-1/2">
            <form className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 rounded-r-md hover:bg-opacity-90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
