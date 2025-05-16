'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    Tag, 
    Save,
    Loader2,
    Upload,
    X,
    Check
} from 'lucide-react';
import { useAlert } from '@/lib/context/alert-context';
import { 
    getCategoryById, 
    getSubcategoryById, 
    updateSubcategory, 
    deleteSubcategory 
} from '@/lib/supabase';
import { Category, Subcategory } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export default function SubcategoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { showAlert } = useAlert();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Get category ID and subcategory ID from URL params
    const categoryId = typeof params.id === 'string' ? parseInt(params.id, 10) : 0;
    const subcategoryId = typeof params.subcategoryId === 'string' ? parseInt(params.subcategoryId, 10) : 0;
    
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for subcategory data
    const [subcategoryData, setSubcategoryData] = useState<Subcategory | null>(null);
    const [categoryData, setCategoryData] = useState<Category | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
        display_order: 0,
        image: '',
        category_id: categoryId
    });
    
    // Image upload states
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    
    // Fetch subcategory and parent category data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch subcategory
                const { data: subcatData, error: subcatError } = await getSubcategoryById(subcategoryId);
                
                if (subcatError) {
                    throw new Error(subcatError.message);
                }
                
                if (subcatData) {
                    setSubcategoryData(subcatData);
                    setFormData({
                        name: subcatData.name,
                        description: subcatData.description || '',
                        is_active: subcatData.is_active,
                        display_order: subcatData.display_order,
                        image: subcatData.image || '',
                        category_id: subcatData.category_id
                    });
                    
                    // Set image preview if exists
                    if (subcatData.image) {
                        setImagePreview(subcatData.image);
                        setUploadedImageUrl(subcatData.image);
                    }
                    
                    // Fetch parent category
                    const { data: catData, error: catError } = await getCategoryById(subcatData.category_id);
                    
                    if (catError) {
                        throw new Error(catError.message);
                    }
                    
                    if (catData) {
                        setCategoryData(catData);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load subcategory');
                showAlert('error', 'Failed to load subcategory', 5000);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [subcategoryId, showAlert]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'display_order' ? parseInt(value, 10) || 0 : value
        });
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
            showAlert('error', 'Please select a valid image file (JPEG, PNG, or WebP)', 3000);
            return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showAlert('error', 'Image size should be less than 2MB', 3000);
            return;
        }
        
        // Show image preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
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
        
        setFormData({
            ...formData,
            image: ''
        });
    };
    
    const handleEdit = () => {
        setIsEditing(true);
    };
    
    const handleCancelEdit = () => {
        // Reset form data to original values
        if (subcategoryData) {
            setFormData({
                name: subcategoryData.name,
                description: subcategoryData.description || '',
                is_active: subcategoryData.is_active,
                display_order: subcategoryData.display_order,
                image: subcategoryData.image || '',
                category_id: subcategoryData.category_id
            });
            
            // Reset image preview
            setImagePreview(subcategoryData.image);
            setUploadedImageUrl(subcategoryData.image);
        }
        setIsEditing(false);
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        
        try {
            const { data, error } = await updateSubcategory(subcategoryId, {
                name: formData.name,
                description: formData.description || null,
                is_active: formData.is_active,
                display_order: formData.display_order,
                image: uploadedImageUrl || null,
                category_id: formData.category_id
            });
            
            if (error) {
                throw new Error(error.message);
            }
            
            if (data && data[0]) {
                setSubcategoryData(data[0]);
            }
            
            showAlert('success', 'Subcategory updated successfully', 3000);
            setIsEditing(false);
        } catch (error) {
            showAlert('error', error instanceof Error ? error.message : 'Failed to update subcategory', 3000);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = () => {
        setIsDeleting(true);
    };
    
    const confirmDelete = async () => {
        try {
            const { error } = await deleteSubcategory(subcategoryId);
            
            if (error) {
                throw new Error(error.message);
            }
            
            showAlert('success', 'Subcategory deleted successfully', 3000);
            router.push(`/admin/categories/${categoryId}`);
        } catch (error) {
            showAlert('error', error instanceof Error ? error.message : 'Failed to delete subcategory', 3000);
            setIsDeleting(false);
        }
    };
    
    const cancelDelete = () => {
        setIsDeleting(false);
    };
    
    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
                    <p className="mt-2 text-gray-500">Loading subcategory...</p>
                </div>
            </div>
        );
    }
    
    if (error || !subcategoryData) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h2 className="text-xl font-medium text-gray-900">Subcategory not found</h2>
                        <p className="mt-2 text-gray-500">The subcategory you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                        <button 
                            onClick={() => router.push(`/admin/categories/${categoryId}`)}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Category
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-6">
            <div className="mb-6">
                <button 
                    onClick={() => router.push(`/admin/categories/${categoryId}`)}
                    className="flex items-center text-gray-600 hover:text-amber-500 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to {categoryData?.name || 'Category'}
                </button>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl font-bold">{subcategoryData.name}</h1>
                        <div className="flex items-center text-sm text-gray-500">
                            <Tag className="h-4 w-4 mr-1" />
                            <span>Subcategory ID: {subcategoryData.subcategory_id}</span>
                        </div>
                    </div>
                    
                    {!isEditing && (
                        <div className="flex space-x-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-amber-100 text-amber-600 px-4 py-2 rounded-md flex items-center"
                                onClick={handleEdit}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-red-100 text-red-600 px-4 py-2 rounded-md flex items-center"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            {isDeleting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Subcategory</h3>
                        <p className="text-gray-500 mb-6">
                            Are you sure you want to delete the subcategory &quot;{subcategoryData.name}&quot;? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                                Delete Subcategory
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Subcategory Image Banner */}
                <div className="relative h-48 md:h-64 bg-gray-200">
                    <Image 
                        src={subcategoryData.image || 'https://placekitten.com/800/400'} 
                        alt={subcategoryData.name} 
                        className="object-cover"
                        fill
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subcategoryData.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {subcategoryData.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                
                <div className="p-6">
                    {isEditing ? (
                        /* Edit Form */
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
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
                                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        />
                                    </div>
                                    
                                    {/* Description */}
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
                                    
                                    {uploadedImageUrl && (
                                        <p className="mt-2 text-xs text-green-600 flex items-center">
                                            <Check className="h-3 w-3 mr-1" /> Image uploaded successfully
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving || isUploadingImage}
                                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center ${isSaving || isUploadingImage ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        /* View Mode */
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants} className="mb-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
                                <p className="text-gray-600">
                                    {subcategoryData.description || 'No description provided.'}
                                </p>
                            </motion.div>
                            
                            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Display Order</h3>
                                    <p className="text-gray-900">{subcategoryData.display_order}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Parent Category</h3>
                                    <p className="text-gray-900">
                                        {categoryData?.name || 'Unknown Category'}
                                    </p>
                                </div>
                            </motion.div>
                            
                            <motion.div variants={itemVariants} className="mt-4">
                                <Link href={`/admin/categories/${categoryId}`}>
                                    <button className="text-amber-500 hover:text-amber-600 underline">
                                        View all subcategories in this category
                                    </button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
} 