'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, Star, Package, DollarSign, Tag, Truck } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAlert } from '@/lib/context/alert-context';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showAlert } = useAlert();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Mock product data - in a real app, this would come from an API
    const product = {
        id: Number(id),
        name: 'Premium Laptop Pro',
        category: 'Electronics',
        price: '$1,299.00',
        status: 'In Stock',
        image: '/laptop.jpg',
        rating: 4.8,
        stock: 34,
        description: 'High-performance laptop with 16GB RAM, 512GB SSD, and dedicated graphics card. Features a stunning 15.6" display, backlit keyboard, and all-day battery life. Perfect for professionals and power users who need reliable performance on the go.',
        sku: 'ELEC-LP-1001',
        weight: '2.1 kg',
        dimensions: '35.8 x 24.5 x 1.8 cm',
        dateAdded: '2023-09-15',
        lastUpdated: '2023-11-20',
        tags: ['laptop', 'electronics', 'premium', 'high-performance'],
        variants: [
            { id: 1, name: 'Silver', sku: 'ELEC-LP-1001-SIL', stock: 12 },
            { id: 2, name: 'Space Gray', sku: 'ELEC-LP-1001-GRY', stock: 22 },
        ],
        sales: 156,
        reviews: 48
    };
    
    useEffect(() => {
        // Simulate API call
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);
    
    const handleDelete = () => {
        // Close modal
        setIsDeleteModalOpen(false);
        
        // Show loading state
        showAlert('info', 'Deleting product...', 1000);
        
        // Simulate API call
        setTimeout(() => {
            showAlert('success', `Product "${product.name}" has been deleted`, 3000);
            router.push('/admin/products');
        }, 1500);
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }
    
    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/admin/products" className="text-gray-500 hover:text-amber-500 flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </Link>
            </div>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{product.name}</h1>
                
                <div className="flex space-x-3">
                    <Link href={`/admin/products/edit/${product.id}`}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-amber-500 text-white px-4 py-2 rounded-md flex items-center"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Product
                        </motion.button>
                    </Link>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center"
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </motion.button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Image */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="bg-gray-100 h-64 rounded-md flex items-center justify-center mb-4">
                        <svg className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    
                    <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.status === 'In Stock' 
                                ? 'bg-green-100 text-green-800' 
                                : product.status === 'Low Stock'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {product.status}
                        </span>
                    </div>
                </div>
                
                {/* Product Details */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Product Information</h2>
                            
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <Tag className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Category</p>
                                        <p className="font-medium">{product.category}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center">
                                    <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Price</p>
                                        <p className="font-medium">{product.price}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center">
                                    <Package className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">SKU</p>
                                        <p className="font-medium">{product.sku}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center">
                                    <Star className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Rating</p>
                                        <p className="font-medium">{product.rating} ({product.reviews} reviews)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Inventory</h2>
                            
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <Truck className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Stock Quantity</p>
                                        <p className="font-medium">{product.stock} units</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center">
                                    <div className="h-5 w-5 mr-3" /> {/* Spacer for alignment */}
                                    <div>
                                        <p className="text-sm text-gray-500">Weight</p>
                                        <p className="font-medium">{product.weight}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center">
                                    <div className="h-5 w-5 mr-3" /> {/* Spacer for alignment */}
                                    <div>
                                        <p className="text-sm text-gray-500">Dimensions</p>
                                        <p className="font-medium">{product.dimensions}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center">
                                    <div className="h-5 w-5 mr-3" /> {/* Spacer for alignment */}
                                    <div>
                                        <p className="text-sm text-gray-500">Total Sales</p>
                                        <p className="font-medium">{product.sales} units</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-2">Description</h2>
                        <p className="text-gray-600">{product.description}</p>
                    </div>
                    
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-2">Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                                <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Variants */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-3">
                    <h2 className="text-lg font-semibold mb-4">Product Variants</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Variant</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">SKU</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.variants.map((variant) => (
                                    <tr key={variant.id} className="border-b">
                                        <td className="py-3 px-4">{variant.name}</td>
                                        <td className="py-3 px-4">{variant.sku}</td>
                                        <td className="py-3 px-4">{variant.stock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Additional Info */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-3">
                    <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="border rounded-md p-4">
                            <p className="text-sm text-gray-500">Date Added</p>
                            <p className="font-medium">{product.dateAdded}</p>
                        </div>
                        
                        <div className="border rounded-md p-4">
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="font-medium">{product.lastUpdated}</p>
                        </div>
                        
                        <div className="border rounded-md p-4">
                            <p className="text-sm text-gray-500">Product ID</p>
                            <p className="font-medium">{product.id}</p>
                        </div>
                        
                        <div className="border rounded-md p-4">
                            <p className="text-sm text-gray-500">Total Variants</p>
                            <p className="font-medium">{product.variants.length}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div 
                        className="bg-white rounded-lg p-6 w-full max-w-md"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h2 className="text-xl font-bold mb-4">Delete Product</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold">{product.name}</span>? 
                            This action cannot be undone.
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-red-500 text-white rounded-md"
                                onClick={handleDelete}
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