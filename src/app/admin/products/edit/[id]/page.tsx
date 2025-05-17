'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAlert } from '@/lib/context/alert-context';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, getProductImages } from '@/lib/supabase/products/products.model';

export default function EditProductPage() {
    const { id } = useParams();
    const { showAlert } = useAlert();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        subcategory_id: '',
        price: '',
        description: '',
        stock_quantity: '',
        is_active: true,
        discount_percentage: '0',
        sku: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch product data
    useEffect(() => {
        async function fetchProductData() {
            try {
                setIsLoading(true);
                
                // Get product data
                const { data: product, error: productError } = await getProductById(id as string);
                
                if (productError) {
                    throw new Error(productError.message);
                }
                
                if (!product) {
                    throw new Error('Product not found');
                }
                
                // Get product images
                const { data: images, error: imagesError } = await getProductImages(id as string);
                
                if (imagesError) {
                    console.error('Error fetching product images:', imagesError);
                }
                
                // Set form data
                setFormData({
                    name: product.name || '',
                    subcategory_id: product.subcategory_id?.toString() || '',
                    price: product.price?.toString() || '',
                    description: product.description || '',
                    stock_quantity: product.stock_quantity?.toString() || '',
                    is_active: product.is_active || false,
                    discount_percentage: product.discount_percentage?.toString() || '0',
                    sku: product.sku || ''
                });
                
                // Set existing images
                if (images && images.length > 0) {
                    setExistingImages(images);
                    
                    // Find primary image for preview
                    const primaryImage = images.find(img => img.is_primary);
                    if (primaryImage) {
                        setImagePreview(primaryImage.image_url);
                    } else if (images.length > 0) {
                        setImagePreview(images[0].image_url);
                    }
                }
                
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err instanceof Error ? err.message : 'Failed to load product');
                showAlert('error', 'Failed to load product data', 5000);
            } finally {
                setIsLoading(false);
            }
        }
        
        if (id) {
            fetchProductData();
        }
    }, [id, showAlert]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if ((e.target as HTMLInputElement).type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            // Show image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            
            setImageFile(file);
            
            // Upload image to server via API
            setIsUploadingImage(true);
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'product-images');
            
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
        setImageFile(null);
        
        // Clear the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleImageUploadClick = () => {
        // Trigger the hidden file input
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Validate form
            if (!formData.name.trim()) {
                showAlert('error', 'Product name is required', 3000);
                setIsSubmitting(false);
                return;
            }
            
            // Prepare the data for submission
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity),
                subcategory_id: parseInt(formData.subcategory_id),
                is_active: formData.is_active,
                discount_percentage: parseFloat(formData.discount_percentage) || 0,
                sku: formData.sku
            };
            
            // Update the product
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to update product');
            }
            
            // If a new image was uploaded, add it as a product image
            if (uploadedImageUrl) {
                const imageResponse = await fetch('/api/products/images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        product_id: id,
                        image_url: uploadedImageUrl,
                        is_primary: existingImages.length === 0, // Make primary if it's the first image
                    }),
                });
                
                const imageResult = await imageResponse.json();
                
                if (!imageResponse.ok) {
                    throw new Error(imageResult.error || 'Failed to add product image');
                }
            }
            
            showAlert('success', 'Product updated successfully!', 3000);
            router.push(`/admin/products/${id}`);
        } catch (error) {
            console.error('Error updating product:', error);
            showAlert('error', error instanceof Error ? error.message : 'Failed to update product', 5000);
        } finally {
            setIsSubmitting(false);
        }
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
    
    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h2 className="text-xl font-medium text-gray-900">Product not found</h2>
                        <p className="mt-2 text-gray-500">The product you're looking for doesn't exist or has been removed.</p>
                        <button 
                            onClick={() => router.push('/admin/products')}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href={`/admin/products/${id}`} className="text-gray-500 hover:text-amber-500 flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Product Details
                </Link>
            </div>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Product</h1>
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
                                    <label htmlFor="subcategory_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subcategory ID *
                                    </label>
                                    <input
                                        type="number"
                                        id="subcategory_id"
                                        name="subcategory_id"
                                        required
                                        value={formData.subcategory_id}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        placeholder="Enter subcategory ID"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        required
                                        step="0.01"
                                        min="0"
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
                                    <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        id="stock_quantity"
                                        name="stock_quantity"
                                        required
                                        min="0"
                                        value={formData.stock_quantity}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        placeholder="0"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Percentage
                                    </label>
                                    <input
                                        type="number"
                                        id="discount_percentage"
                                        name="discount_percentage"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.discount_percentage}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    id="sku"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    placeholder="Enter SKU"
                                />
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-amber-500 focus:ring-amber-300 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                    Active (visible to customers)
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
                                    <Image 
                                        src={imagePreview} 
                                        alt="Product preview" 
                                        className="w-full h-full object-cover"
                                        width={400}
                                        height={400}
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
                                <div 
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-64 mb-4 cursor-pointer hover:bg-gray-50"
                                    onClick={handleImageUploadClick}
                                >
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
                                className={`block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium ${
                                    isUploadingImage 
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
                            
                            {existingImages.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Existing Images ({existingImages.length})
                                    </p>
                                    <p className="text-xs text-gray-500 mb-2">
                                        New uploaded image will be added to these existing images
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <Link 
                            href={`/admin/products/${id}`}
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
                            ) : "Update Product"}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
} 