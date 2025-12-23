'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, Check, Loader2 } from 'lucide-react';
import { useAlert } from '@/providers/alert-provider';
import { getCategoryById, createSubcategory } from '@/services/supabase';

import Image from 'next/image';
import { CreateSubcategoryDTO } from '@/types/category';

export default function AddSubcategoryPage() {
    const params = useParams();
    const router = useRouter();
    const { showAlert } = useAlert();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get category ID from URL params
    const categoryId = typeof params.id === 'number' ? params.id : 0;

    const [categoryName, setCategoryName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        display_order: 0,
        is_active: true,
        image: null as string | null,
        category_id: categoryId
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch parent category name
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await getCategoryById(categoryId);

                if (error) {
                    throw new Error(error.message);
                }

                if (data) {
                    setCategoryName(data.name);
                }
            } catch {
                showAlert('error', 'Failed to load parent category', 3000);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategory();
    }, [categoryId, showAlert]);

    // Hiển thị loading indicator khi đang tải dữ liệu danh mục cha
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading category information...</span>
            </div>
        );
    }

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

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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

        // Show image preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Clear error if exists
        if (errors.image) {
            setErrors({
                ...errors,
                image: ''
            });
        }

        // Upload image to Supabase
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
            showAlert('error', `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`, 5000);
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

        setFormData({
            ...formData,
            image: null
        });
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Subcategory name is required';
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
            // Use the URL of the uploaded image
            const subcategoryData: CreateSubcategoryDTO = {
                name: formData.name,
                description: formData.description || null,
                image: uploadedImageUrl,
                is_active: formData.is_active,
                display_order: formData.display_order,
                category_id: categoryId
            };

            const { error } = await createSubcategory(subcategoryData);

            if (error) {
                throw new Error(error.message);
            }

            showAlert('success', 'Subcategory created successfully', 3000);
            router.push(`/admin/categories/${categoryId}`);
        } catch (error) {
            showAlert('error', error instanceof Error ? error.message : 'Failed to create subcategory', 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <button
                    onClick={() => router.push(`/admin/categories/${categoryId}`)}
                    className="flex items-center text-gray-600 hover:text-amber-500 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to {categoryName || 'Category'}
                </button>

                <h1 className="text-2xl font-bold">Add New Subcategory</h1>
                <p className="text-gray-500 text-sm">Create a new subcategory for {categoryName}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {/* Subcategory Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subcategory Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300`}
                                    placeholder="e.g. Smartphones"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Subcategory Description */}
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
                                    placeholder="Describe this subcategory..."
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
                                    Subcategories with lower numbers will be displayed first
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

                        {/* Subcategory Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subcategory Image
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
                                                    ref={fileInputRef}
                                                    disabled={isUploadingImage}
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
                                        alt="Subcategory preview"
                                        className="object-cover rounded-md"
                                        fill
                                    />
                                    {isUploadingImage && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                                            <span className="text-white ml-2">Uploading...</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        disabled={isUploadingImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {errors.image && (
                                <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                            )}

                            {uploadedImageUrl && (
                                <p className="mt-2 text-xs text-green-600 flex items-center">
                                    <Check className="h-3 w-3 mr-1" /> Image uploaded successfully
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.push(`/admin/categories/${categoryId}`)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            Cancel
                        </button>

                        <motion.button
                            type="submit"
                            disabled={isSubmitting || isUploadingImage}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center ${(isSubmitting || isUploadingImage) ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                                    Create Subcategory
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
} 