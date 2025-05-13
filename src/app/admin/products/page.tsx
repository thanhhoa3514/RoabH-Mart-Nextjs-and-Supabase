'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useAlert } from '@/lib/context/alert-context';
import Link from 'next/link';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function ProductsPage() {
    const { showAlert } = useAlert();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
    const [sortBy, setSortBy] = useState('Newest');
    const [productToDelete, setProductToDelete] = useState<{id: number, name: string} | null>(null);

    // Mock products data
    const products = [
        { 
            id: 1, 
            name: 'Premium Laptop Pro', 
            category: 'Electronics', 
            price: '$1,299.00', 
            status: 'In Stock',
            image: '/laptop.jpg',
            rating: 4.8,
            stock: 34,
            description: 'High-performance laptop with 16GB RAM, 512GB SSD, and dedicated graphics card.'
        },
        { 
            id: 2, 
            name: 'Wireless Headphones', 
            category: 'Electronics', 
            price: '$199.00', 
            status: 'In Stock',
            image: '/headphones.jpg',
            rating: 4.5,
            stock: 42,
            description: 'Noise-cancelling wireless headphones with 30-hour battery life.'
        },
        { 
            id: 3, 
            name: 'Smart Watch Pro', 
            category: 'Electronics', 
            price: '$299.00', 
            status: 'Low Stock',
            image: '/watch.jpg',
            rating: 4.7,
            stock: 8,
            description: 'Fitness tracking smartwatch with heart rate monitor and GPS.'
        },
        { 
            id: 4, 
            name: 'Organic Cotton T-shirt', 
            category: 'Clothing', 
            price: '$29.99', 
            status: 'In Stock',
            image: '/tshirt.jpg',
            rating: 4.3,
            stock: 120,
            description: '100% organic cotton t-shirt, available in multiple colors.'
        },
        { 
            id: 5, 
            name: 'Ceramic Coffee Mug', 
            category: 'Home & Kitchen', 
            price: '$14.99', 
            status: 'In Stock',
            image: '/mug.jpg',
            rating: 4.6,
            stock: 75,
            description: 'Handcrafted ceramic coffee mug, microwave and dishwasher safe.'
        },
        { 
            id: 6, 
            name: 'Bluetooth Speaker', 
            category: 'Electronics', 
            price: '$79.99', 
            status: 'Out of Stock',
            image: '/speaker.jpg',
            rating: 4.4,
            stock: 0,
            description: 'Portable Bluetooth speaker with 12-hour battery life and water resistance.'
        },
        { 
            id: 7, 
            name: 'Yoga Mat', 
            category: 'Sports', 
            price: '$39.99', 
            status: 'In Stock',
            image: '/yogamat.jpg',
            rating: 4.2,
            stock: 28,
            description: 'Non-slip yoga mat made from eco-friendly materials.'
        },
        { 
            id: 8, 
            name: 'Stainless Steel Water Bottle', 
            category: 'Sports', 
            price: '$24.99', 
            status: 'In Stock',
            image: '/bottle.jpg',
            rating: 4.8,
            stock: 65,
            description: 'Vacuum insulated stainless steel water bottle, keeps drinks cold for 24 hours.'
        },
    ];

    const handleDelete = (id: number, name: string) => {
        // Show loading state
        showAlert('info', 'Deleting product...', 1000);
        
        // Simulate API call
        setTimeout(() => {
            showAlert('success', `Product "${name}" has been deleted`, 3000);
            // In a real app, you would remove the product from the list or refetch the data
            setProductToDelete(null);
        }, 1500);
    };

    const handleEdit = (id: number, name: string) => {
        showAlert('success', `Editing product "${name}"`, 3000);
    };

    const handleView = (id: number, name: string) => {
        showAlert('info', `Viewing product "${name}" details`, 3000);
    };

    const openDeleteModal = (id: number, name: string) => {
        setProductToDelete({ id, name });
    };

    // Filter products based on search query
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Product Management</h1>
                    <p className="text-gray-500 text-sm">Manage your product inventory, add new products, and update existing ones.</p>
                </div>

                <Link href="/admin/products/add">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-amber-500 text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Product
                    </motion.button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option>All Categories</option>
                            <option>Electronics</option>
                            <option>Clothing</option>
                            <option>Home & Kitchen</option>
                            <option>Sports</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option>All Status</option>
                            <option>In Stock</option>
                            <option>Low Stock</option>
                            <option>Out of Stock</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                        <select
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={selectedPriceRange}
                            onChange={(e) => setSelectedPriceRange(e.target.value)}
                        >
                            <option>All Prices</option>
                            <option>Under $50</option>
                            <option>$50 - $200</option>
                            <option>$200 - $500</option>
                            <option>$500+</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option>Newest</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Name: A to Z</option>
                            <option>Name: Z to A</option>
                        </select>
                    </div>
                </div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            variants={itemVariants}
                            className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
                        >
                            <div className="p-4 relative">
                                <div className="bg-gray-200 h-40 rounded-md flex items-center justify-center mb-3">
                                    <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                
                                {product.status === 'In Stock' && (
                                    <span className="absolute top-6 right-6 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                        In Stock
                                    </span>
                                )}
                                {product.status === 'Low Stock' && (
                                    <span className="absolute top-6 right-6 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                        Low Stock
                                    </span>
                                )}
                                {product.status === 'Out of Stock' && (
                                    <span className="absolute top-6 right-6 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                        Out of Stock
                                    </span>
                                )}
                                
                                <div className="text-xs text-amber-500 flex items-center mb-1">
                                    <span className="mr-1">{product.category}</span>
                                    <div className="flex items-center ml-auto">
                                        <span className="text-yellow-500 mr-1">★</span>
                                        <span>{product.rating}</span>
                                    </div>
                                </div>
                                
                                <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                                
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">{product.price}</span>
                                    <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                                </div>
                                
                                <div className="flex justify-between mt-4">
                                    <button 
                                        className="bg-amber-100 text-amber-600 px-4 py-1 rounded text-sm"
                                        onClick={() => handleEdit(product.id, product.name)}
                                    >
                                        Edit
                                    </button>
                                    
                                    <div className="flex space-x-2">
                                        <Link href={`/admin/products/${product.id}`}>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-1 bg-gray-100 rounded"
                                            >
                                                <Eye className="h-4 w-4 text-gray-600" />
                                            </motion.button>
                                        </Link>
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-1 bg-gray-100 rounded"
                                            onClick={() => openDeleteModal(product.id, product.name)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
            
            {/* Delete Confirmation Modal */}
            {productToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div 
                        className="bg-white rounded-lg p-6 w-full max-w-md"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h2 className="text-xl font-bold mb-4">Delete Product</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold">{productToDelete.name}</span>? 
                            This action cannot be undone.
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                                onClick={() => setProductToDelete(null)}
                            >
                                Cancel
                            </button>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-red-500 text-white rounded-md"
                                onClick={() => handleDelete(productToDelete.id, productToDelete.name)}
                            >
                                Delete
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
} 