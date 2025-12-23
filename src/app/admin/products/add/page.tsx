'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/providers/alert-provider';
import { useRouter } from 'next/navigation';
import { getCategories } from '@/services/supabase/categories/category.service';
import { getSubcategories } from '@/lib/supabase/subcategories/subcategory.service';

interface Category {
    category_id: number;
    name: string;
}

interface Subcategory {
    subcategory_id: number;
    category_id: number;
    name: string;
}

export default function AddProductPage() {
    const { showAlert } = useAlert();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        subcategory_id: '',
        price: '',
        description: '',
        stock: '',
        status: 'In Stock',
        featured: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

    // Fetch categories and subcategories
    useEffect(() => {
        const fetchCategoriesAndSubcategories = async () => {
            try {
                const { data: categoriesData } = await getCategories();
                if (categoriesData) {
                    setCategories(categoriesData);
                }

                const { data: subcategoriesData } = await getSubcategories();
                if (subcategoriesData) {
                    setSubcategories(subcategoriesData);
                }
            } catch (error) {
                console.error('Error fetching categories/subcategories:', error);
                showAlert('error', 'Failed to load categories', 3000);
            }
        };

        fetchCategoriesAndSubcategories();
    }, [showAlert]);

    // Filter subcategories when category changes
    useEffect(() => {
        if (formData.category_id) {
            const categoryId = parseInt(formData.category_id);
            const filtered = subcategories.filter(sub => sub.category_id === categoryId);
            setFilteredSubcategories(filtered);

            // Reset subcategory selection when category changes
            setFormData(prev => ({ ...prev, subcategory_id: '' }));
        } else {
            setFilteredSubcategories([]);
        }
    }, [formData.category_id, subcategories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show image preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload image to server
        try {
            setIsUploadingImage(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            // Save the uploaded image URL
            setUploadedImageUrl(result.url);
            showAlert('success', 'Image uploaded successfully', 2000);
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert('error', `Failed to upload image: ${(error as Error).message}`, 5000);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setUploadedImageUrl(null);

        // Clear the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.subcategory_id) {
            showAlert('error', 'Please select a subcategory', 3000);
            setIsSubmitting(false);
            return;
        }

        try {
            // Create product data object for the API
            const productData = {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                stock: formData.stock,
                subcategory_id: parseInt(formData.subcategory_id),
                seller_id: 1, // Assuming a default seller ID for now
                status: formData.status,
                featured: formData.featured
            };

            // Call the API endpoint to create the product
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to add product');
            }

            // If we have an uploaded image, associate it with the product
            if (uploadedImageUrl && result.data && result.data.product_id) {
                const imageData = {
                    product_id: result.data.product_id,
                    image_url: uploadedImageUrl,
                    is_primary: true
                };

                const imageResponse = await fetch('/api/product-images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(imageData),
                });

                if (!imageResponse.ok) {
                    const imageError = await imageResponse.json();
                    console.error('Error adding product image:', imageError);
                    // Continue even if image association fails
                }
            }

            // Show success message
            showAlert('success', 'Product added successfully!', 3000);

            // Redirect to products page
            router.push('/admin/products');
        } catch (error) {
            console.error('Error adding product:', error);
            showAlert('error', `Failed to add product: ${(error as Error).message}`, 5000);
        } finally {
            setIsSubmitting(false);
        }
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
                                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        id="category_id"
                                        name="category_id"
                                        required
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(category => (
                                            <option key={category.category_id} value={category.category_id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="subcategory_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subcategory *
                                    </label>
                                    <select
                                        id="subcategory_id"
                                        name="subcategory_id"
                                        required
                                        value={formData.subcategory_id}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        disabled={!formData.category_id}
                                    >
                                        <option value="">Select subcategory</option>
                                        {filteredSubcategories.map(subcategory => (
                                            <option key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
                                                {subcategory.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                    {isUploadingImage && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                                            <span className="text-white ml-2">Uploading...</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        disabled={isUploadingImage}
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
                                ref={fileInputRef}
                                disabled={isUploadingImage}
                            />

                            <label
                                htmlFor="image"
                                className={`block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium ${isUploadingImage
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                                    }`}
                            >
                                {isUploadingImage
                                    ? "Uploading..."
                                    : imagePreview
                                        ? "Change Image"
                                        : "Select Image"
                                }
                            </label>

                            {uploadedImageUrl && (
                                <p className="mt-2 text-xs text-green-600">
                                    ✓ Image uploaded successfully
                                </p>
                            )}
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
                            disabled={isSubmitting || isUploadingImage}
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

