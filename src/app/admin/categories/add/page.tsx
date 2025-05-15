'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, Check } from 'lucide-react';
import { useAlert } from '@/lib/context/alert-context';
import { createCategory } from '@/lib/supabase';

import Image from 'next/image';

export default function AddCategoryPage() {
    const router = useRouter();
    const { showAlert } = useAlert();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        display_order: 0,
        is_active: true,
        image: null as string | null
    });
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'display_order' ? parseInt(value, 10) || 0 : value
        });
        
        // Clear error when field is edited
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked
        });
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validate file type
            if (!file.type.match(/image\/(jpeg|jpg|png|webp)/i)) {
                setErrors({
                    ...errors,
                    image: 'Please select a valid image file (JPEG, PNG, or WebP)'
                });
                return;
            }
            
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setErrors({
                    ...errors,
                    image: 'Image size should be less than 2MB'
                });
                return;
            }
            
            setImagePreview(URL.createObjectURL(file));
            
            // Clear error if exists
            if (errors.image) {
                setErrors({
                    ...errors,
                    image: ''
                });
            }
        }
    };
    
    const removeImage = () => {
        setImagePreview(null);
        setFormData({
            ...formData,
            image: null
        });
    };
    
    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // In a real app, you would upload the image to storage
            // For now, we'll just use the image URL directly if available
            const imageUrl = imagePreview; // In a real app, upload image and get URL
            
            const categoryData = {
                name: formData.name,
                description: formData.description || null,
                image: imageUrl,
                is_active: formData.is_active,
                display_order: formData.display_order
            };
            
            const { error } = await createCategory(categoryData);
            
            if (error) {
                throw new Error(error.message);
            }
            
            showAlert('success', 'Category created successfully', 3000);
            router.push('/admin/categories');
        } catch (error) {
            showAlert('error', error instanceof Error ? error.message : 'Failed to create category', 3000);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="p-6">
            <div className="mb-6">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-amber-500 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Categories
                </button>
                
                <h1 className="text-2xl font-bold">Add New Category</h1>
                <p className="text-gray-500 text-sm">Create a new product category</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {/* Category Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300`}
                                    placeholder="e.g. Electronics"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>
                            
                            {/* Category Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    placeholder="Describe this category..."
                                />
                            </div>
                            
                            {/* Display Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    name="display_order"
                                    value={formData.display_order}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Categories with lower numbers will be displayed first
                                </p>
                            </div>
                            
                            {/* Active Status */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-amber-500 focus:ring-amber-300 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                    Active (visible to customers)
                                </label>
                            </div>
                        </div>
                        
                        {/* Category Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Image
                            </label>
                            
                            {!imagePreview ? (
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500">
                                                <span>Upload an image</span>
                                                <input
                                                    id="image-upload"
                                                    name="image"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    className="sr-only"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, or WebP up to 2MB
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-1 relative h-64">
                                    <Image
                                        src={imagePreview}
                                        alt="Category preview"
                                        className="object-cover rounded-md"
                                        fill
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                            
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            Cancel
                        </button>
                        
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Create Category
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
} 