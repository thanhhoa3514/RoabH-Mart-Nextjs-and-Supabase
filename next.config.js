/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'placekitten.com',
      'example.com',
      'dituqzgjijnwjroetrqj.supabase.co',
      'ufmejreyxbojrvzxgztz.supabase.co' // Add your actual Supabase project domain
    ],
  },
  // Uncomment this after resolving build issues
  // output: 'standalone',
};

module.exports = nextConfig; 