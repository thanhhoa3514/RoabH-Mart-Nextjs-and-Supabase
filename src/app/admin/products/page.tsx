'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Eye, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAlert } from '@/providers/alert-provider';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/lib/supabase/products/product.service';

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

interface Product {
    product_id: number;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    status?: string;
    is_active: boolean;
    discount_percentage: number;
    sku: string;
    subcategories: {
        name: string;
        categories: {
            name: string;
        }
    };
    product_images: {
        image_url: string;
        is_primary: boolean;
    }[];
}

export default function ProductsPage() {
    const { showAlert } = useAlert();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
    const [sortBy, setSortBy] = useState('Newest');
    const [productToDelete, setProductToDelete] = useState<{id: number, name: string} | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch products
    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await getProducts();
            
            if (error) {
                throw new Error(error.message);
            }
            
            if (data) {
                setProducts(data);
                
                // Extract unique categories
                const uniqueCategories = Array.from(
                    new Set(data.map(product => 
                        product.subcategories?.categories?.name || 'Uncategorized'
                    ))
                );
                setCategories(uniqueCategories);
            }
        } catch (err) {
            setError((err as Error).message);
            showAlert('error', `Failed to load products: ${(err as Error).message}`, 5000);
        } finally {
            setIsLoading(false);
        }
    };

    // Load products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, selectedStatus, selectedPriceRange]);

    const handleDelete = async (id: number, name: string) => {
        // Show loading state
        showAlert('info', 'Deleting product...', 1000);
        
        try {
            // Call API to delete product
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete product');
            }
            
            showAlert('success', `Product "${name}" has been deleted`, 3000);
            // Refetch products to update the list
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            showAlert('error', `Failed to delete product: ${(error as Error).message}`, 5000);
        } finally {
            setProductToDelete(null);
        }
    };

    const handleEdit = (id: number) => {
        // Navigate to edit page
        window.location.href = `/admin/products/edit/${id}`;
    };

    const openDeleteModal = (id: number, name: string) => {
        setProductToDelete({ id, name });
    };

    // Get status based on stock_quantity
    const getProductStatus = (product: Product) => {
        if (product.stock_quantity <= 0) return 'Out of Stock';
        if (product.stock_quantity < 10) return 'Low Stock';
        return 'In Stock';
    };

    // Get primary image or placeholder
    const getProductImage = (product: Product) => {
        const primaryImage = product.product_images?.find(img => img.is_primary);
        return primaryImage?.image_url || '';
    };

    // Format price to currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    // Filter products based on search query and filters
    const filteredProducts = products.filter(product => {
        // Search filter
        const matchesSearch = searchQuery === '' || 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.subcategories?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.subcategories?.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Category filter
        const matchesCategory = selectedCategory === 'All Categories' ||
            product.subcategories?.categories?.name === selectedCategory;
            
        // Status filter
        const status = getProductStatus(product);
        const matchesStatus = selectedStatus === 'All Status' || status === selectedStatus;
        
        // Price filter
        let matchesPrice = true;
        if (selectedPriceRange !== 'All Prices') {
            const price = product.price;
            
            if (selectedPriceRange === 'Under $50' && price >= 50) matchesPrice = false;
            else if (selectedPriceRange === '$50 - $200' && (price < 50 || price > 200)) matchesPrice = false;
            else if (selectedPriceRange === '$200 - $500' && (price < 200 || price > 500)) matchesPrice = false;
            else if (selectedPriceRange === '$500+' && price < 500) matchesPrice = false;
        }
        
        return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    });
    
    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'Newest') {
            return (b.product_id || 0) - (a.product_id || 0);
        } else if (sortBy === 'Price: Low to High') {
            return a.price - b.price;
        } else if (sortBy === 'Price: High to Low') {
            return b.price - a.price;
        } else if (sortBy === 'Name: A to Z') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'Name: Z to A') {
            return b.name.localeCompare(a.name);
        }
        return 0;
    });
    
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    
    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Product Management</h1>
                    <p className="text-gray-500 text-sm">Manage your product inventory, add new products, and update existing ones.</p>
                </div>

                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center"
                        onClick={fetchProducts}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </motion.button>
                    
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
                            {categories.map((category, index) => (
                                <option key={index}>{category}</option>
                            ))}
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

                {/* Results summary and items per page selector */}
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">
                        Showing {sortedProducts.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} products
                    </div>
                    <div className="flex items-center">
                        <label className="text-sm text-gray-500 mr-2">Items per page:</label>
                        <select
                            className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(parseInt(e.target.value));
                                setCurrentPage(1); // Reset to first page when items per page changes
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">
                        <p>Error loading products: {error}</p>
                        <button 
                            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-md"
                            onClick={fetchProducts}
                        >
                            Try Again
                        </button>
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No products found. Try adjusting your filters or add a new product.</p>
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {currentItems.map((product) => {
                            const status = getProductStatus(product);
                            const categoryName = product.subcategories?.categories?.name || 'Uncategorized';
                            const subcategoryName = product.subcategories?.name || '';
                            
                            return (
                                <motion.div
                                    key={product.product_id}
                                    variants={itemVariants}
                                    className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
                                >
                                    <div className="p-4 relative">
                                        <div className="bg-gray-200 h-40 rounded-md flex items-center justify-center mb-3">
                                            {getProductImage(product) ? (
                                                <Image 
                                                    src={getProductImage(product)} 
                                                    alt={product.name}
                                                    width={160}
                                                    height={160}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>
                                        
                                        {status === 'In Stock' && (
                                            <span className="absolute top-6 right-6 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                In Stock
                                            </span>
                                        )}
                                        {status === 'Low Stock' && (
                                            <span className="absolute top-6 right-6 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                                Low Stock
                                            </span>
                                        )}
                                        {status === 'Out of Stock' && (
                                            <span className="absolute top-6 right-6 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                                Out of Stock
                                            </span>
                                        )}
                                        
                                        <div className="text-xs text-amber-500 flex items-center mb-1">
                                            <span className="mr-1">{categoryName}</span>
                                            <span className="ml-1 text-gray-400">/ {subcategoryName}</span>
                                            <div className="flex items-center ml-auto">
                                                {product.discount_percentage > 0 && (
                                                    <span className="text-red-500 mr-1">-{product.discount_percentage}%</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold">{formatPrice(product.price)}</span>
                                            <span className="text-xs text-gray-500">Stock: {product.stock_quantity}</span>
                                        </div>
                                        
                                        <div className="flex justify-between mt-4">
                                            <button 
                                                className="bg-amber-100 text-amber-600 px-4 py-1 rounded text-sm"
                                                onClick={() => handleEdit(product.product_id)}
                                            >
                                                Edit
                                            </button>
                                            
                                            <div className="flex space-x-2">
                                                <Link href={`/admin/products/${product.product_id}`}>
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
                                                    onClick={() => openDeleteModal(product.product_id, product.name)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
                
                {/* Pagination */}
                {!isLoading && !error && sortedProducts.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <nav className="flex items-center">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className={`mx-1 p-2 rounded-md ${
                                    currentPage === 1 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-gray-700 hover:bg-amber-100'
                                }`}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            
                            <div className="flex mx-2">
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                                    // Calculate what page numbers to show
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        // If 5 or fewer pages, show all
                                        pageNumber = idx + 1;
                                    } else if (currentPage <= 3) {
                                        // At the start of pagination
                                        pageNumber = idx + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        // At the end of pagination
                                        pageNumber = totalPages - 4 + idx;
                                    } else {
                                        // In the middle
                                        pageNumber = currentPage - 2 + idx;
                                    }
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => paginate(pageNumber)}
                                            className={`mx-1 w-8 h-8 rounded-md ${
                                                currentPage === pageNumber
                                                    ? 'bg-amber-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-amber-100'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                                
                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <>
                                        <span className="mx-1 text-gray-500">...</span>
                                        <button
                                            onClick={() => paginate(totalPages)}
                                            className="mx-1 w-8 h-8 rounded-md bg-gray-100 text-gray-700 hover:bg-amber-100"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className={`mx-1 p-2 rounded-md ${
                                    currentPage === totalPages 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-gray-700 hover:bg-amber-100'
                                }`}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                )}
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

