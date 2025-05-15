import { supabase } from '../lib/supabase/client/client.model';

/**
 * This script seeds the database with test products and categories.
 * Run it with: npx ts-node src/scripts/seed-products.ts
 */
async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Step 1: Create categories
    const categories = [
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        image: 'https://placekitten.com/400/300',
        is_active: true,
        display_order: 1
      },
      {
        name: 'Clothing',
        description: 'Apparel and fashion items',
        image: 'https://placekitten.com/401/300',
        is_active: true,
        display_order: 2
      },
      {
        name: 'Home',
        description: 'Home and garden products',
        image: 'https://placekitten.com/402/300',
        is_active: true,
        display_order: 3
      }
    ];

    console.log('Creating categories...');
    const { data: createdCategories, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'name' })
      .select();

    if (categoriesError) {
      throw new Error(`Error seeding categories: ${categoriesError.message}`);
    }

    console.log(`Created ${createdCategories?.length} categories`);

    // Step 2: Create subcategories for each category
    const subcategories = [
      // Electronics subcategories
      {
        category_id: createdCategories?.find(c => c.name === 'Electronics')?.category_id,
        name: 'Smartphones',
        description: 'Mobile phones and accessories',
        image: 'https://placekitten.com/403/300',
        is_active: true,
        display_order: 1
      },
      {
        category_id: createdCategories?.find(c => c.name === 'Electronics')?.category_id,
        name: 'Laptops',
        description: 'Portable computers',
        image: 'https://placekitten.com/404/300',
        is_active: true,
        display_order: 2
      },
      // Clothing subcategories
      {
        category_id: createdCategories?.find(c => c.name === 'Clothing')?.category_id,
        name: 'T-shirts',
        description: 'Casual t-shirts',
        image: 'https://placekitten.com/405/300',
        is_active: true,
        display_order: 1
      },
      {
        category_id: createdCategories?.find(c => c.name === 'Clothing')?.category_id,
        name: 'Jeans',
        description: 'Denim pants',
        image: 'https://placekitten.com/406/300',
        is_active: true,
        display_order: 2
      },
      // Home subcategories
      {
        category_id: createdCategories?.find(c => c.name === 'Home')?.category_id,
        name: 'Kitchen',
        description: 'Kitchen appliances and tools',
        image: 'https://placekitten.com/407/300',
        is_active: true,
        display_order: 1
      },
      {
        category_id: createdCategories?.find(c => c.name === 'Home')?.category_id,
        name: 'Furniture',
        description: 'Home furniture',
        image: 'https://placekitten.com/408/300',
        is_active: true,
        display_order: 2
      }
    ];

    console.log('Creating subcategories...');
    const { data: createdSubcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .upsert(subcategories, { onConflict: 'name' })
      .select();

    if (subcategoriesError) {
      throw new Error(`Error seeding subcategories: ${subcategoriesError.message}`);
    }

    console.log(`Created ${createdSubcategories?.length} subcategories`);

    // Step 3: Create a test seller
    const seller = {
      name: 'Test Seller',
      description: 'A test seller account',
      contact_info: 'contact@testshop.com',
      logo: 'https://placekitten.com/200/200',
      is_verified: true
    };

    console.log('Creating seller...');
    const { data: createdSeller, error: sellerError } = await supabase
      .from('sellers')
      .upsert(seller, { onConflict: 'name' })
      .select();

    if (sellerError) {
      throw new Error(`Error seeding seller: ${sellerError.message}`);
    }

    console.log(`Created seller: ${createdSeller?.[0]?.name}`);

    // Step 4: Create products
    const products = [
      // Electronics - Smartphones
      {
        subcategory_id: createdSubcategories?.find(sc => sc.name === 'Smartphones')?.subcategory_id,
        seller_id: createdSeller?.[0]?.seller_id,
        name: 'Awesome Smartphone',
        description: 'The latest smartphone with amazing features',
        price: 799.99,
        stock_quantity: 50,
        discount_percentage: 5,
        sku: 'SP-001',
        is_active: true
      },
      {
        subcategory_id: createdSubcategories?.find(sc => sc.name === 'Smartphones')?.subcategory_id,
        seller_id: createdSeller?.[0]?.seller_id,
        name: 'Budget Phone',
        description: 'Affordable smartphone with great value',
        price: 299.99,
        stock_quantity: 100,
        discount_percentage: 0,
        sku: 'SP-002',
        is_active: true
      },
      // Electronics - Laptops
      {
        subcategory_id: createdSubcategories?.find(sc => sc.name === 'Laptops')?.subcategory_id,
        seller_id: createdSeller?.[0]?.seller_id,
        name: 'Pro Laptop',
        description: 'Powerful laptop for professionals',
        price: 1299.99,
        stock_quantity: 30,
        discount_percentage: 10,
        sku: 'LP-001',
        is_active: true
      },
      // Clothing - T-shirts
      {
        subcategory_id: createdSubcategories?.find(sc => sc.name === 'T-shirts')?.subcategory_id,
        seller_id: createdSeller?.[0]?.seller_id,
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 19.99,
        stock_quantity: 200,
        discount_percentage: 0,
        sku: 'TS-001',
        is_active: true
      },
      // Clothing - Jeans
      {
        subcategory_id: createdSubcategories?.find(sc => sc.name === 'Jeans')?.subcategory_id,
        seller_id: createdSeller?.[0]?.seller_id,
        name: 'Slim Fit Jeans',
        description: 'Stylish slim fit jeans',
        price: 49.99,
        stock_quantity: 150,
        discount_percentage: 0,
        sku: 'JN-001',
        is_active: true
      },
      // Home - Kitchen
      {
        subcategory_id: createdSubcategories?.find(sc => sc.name === 'Kitchen')?.subcategory_id,
        seller_id: createdSeller?.[0]?.seller_id,
        name: 'Blender',
        description: 'High-speed blender for smoothies and food prep',
        price: 89.99,
        stock_quantity: 75,
        discount_percentage: 15,
        sku: 'KT-001',
        is_active: true
      },
      // Home - Furniture
      {
        subcategory_id: createdSubcategories?.find(sc => sc.name === 'Furniture')?.subcategory_id,
        seller_id: createdSeller?.[0]?.seller_id,
        name: 'Coffee Table',
        description: 'Modern coffee table for your living room',
        price: 199.99,
        stock_quantity: 25,
        discount_percentage: 0,
        sku: 'FN-001',
        is_active: true
      }
    ];

    console.log('Creating products...');
    const { data: createdProducts, error: productsError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'sku' })
      .select();

    if (productsError) {
      throw new Error(`Error seeding products: ${productsError.message}`);
    }

    console.log(`Created ${createdProducts?.length} products`);

    // Step 5: Create product images
    const images = [];
    
    for (const product of createdProducts || []) {
      // Add primary image
      images.push({
        product_id: product.product_id,
        image_url: `https://placekitten.com/${300 + images.length}/300`,
        is_primary: true,
        display_order: 0
      });
      
      // Add secondary images
      for (let i = 1; i <= 2; i++) {
        images.push({
          product_id: product.product_id,
          image_url: `https://placekitten.com/${300 + images.length}/300`,
          is_primary: false,
          display_order: i
        });
      }
    }

    console.log('Creating product images...');
    const { data: createdImages, error: imagesError } = await supabase
      .from('product_images')
      .upsert(images)
      .select();

    if (imagesError) {
      throw new Error(`Error seeding product images: ${imagesError.message}`);
    }

    console.log(`Created ${createdImages?.length} product images`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase }; 