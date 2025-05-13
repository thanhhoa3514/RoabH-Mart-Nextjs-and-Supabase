'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/lib/context/alert-context';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
    const { showAlert } = useAlert();
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        stock: '',
        status: 'In Stock',
        featured: false
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeImage = () => {
        setImagePreview(null);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            showAlert('success', 'Product added successfully!', 3000);
            setIsSubmitting(false);
            router.push('/admin/products');
        }, 1500);
    };
    
    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/admin/products" className="text-gray-500 hover:text-amber-500 flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </Link>
            </div>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Add New Product</h1>
            </div>
            
            <motion.div
                className="bg-white rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Product Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    placeholder="Enter product name"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    >
                                        <option value="">Select category</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Home & Kitchen">Home & Kitchen</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Books">Books</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Price ($) *
                                    </label>
                                    <input
                                        type="text"
                                        id="price"
                                        name="price"
                                        required
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    placeholder="Enter product description"
                                ></textarea>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        id="stock"
                                        name="stock"
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        placeholder="0"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    >
                                        <option>In Stock</option>
                                        <option>Low Stock</option>
                                        <option>Out of Stock</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-amber-500 focus:ring-amber-300 border-gray-300 rounded"
                                />
                                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                                    Feature this product on homepage
                                </label>
                            </div>
                        </div>
                        
                        {/* Right Column - Product Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Image
                            </label>
                            
                            {imagePreview ? (
                                <div className="relative rounded-lg overflow-hidden h-64 mb-4">
                                    <img 
                                        src={imagePreview} 
                                        alt="Product preview" 
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-64 mb-4">
                                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 text-center">
                                        Drag and drop an image here, or click to select a file
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        PNG, JPG up to 5MB
                                    </p>
                                </div>
                            )}
                            
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            
                            <label
                                htmlFor="image"
                                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                            >
                                {imagePreview ? "Change Image" : "Select Image"}
                            </label>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <Link 
                            href="/admin/products"
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md mr-4 hover:bg-gray-200"
                        >
                            Cancel
                        </Link>
                        
                        <motion.button
                            type="submit"
                            className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 flex items-center justify-center min-w-[100px]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Save Product"}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
} 