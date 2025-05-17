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
    Plus,
    Image as ImageIcon,
    Upload,
    X
} from 'lucide-react';
import { useAlert } from '@/lib/context/alert-context';
import { getCategoryWithImageById, deleteCategory, getSubcategories } from '@/lib/supabase';
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

export default function CategoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { showAlert } = useAlert();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Get category ID from URL params
    const categoryId = typeof params.id === 'string' ? parseInt(params.id, 10) : 0;
    
    // State for category data
    const [categoryData, setCategoryData] = useState<Category | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
        display_order: 0,
        image: ''
    });
    
    // State for image preview and file
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    
    // State for subcategories
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loadingSubcategories, setLoadingSubcategories] = useState(true);
    
    // Fetch category data
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await getCategoryWithImageById(categoryId);
                
                if (error) {
                    throw new Error(error.message);
                }
                
                if (data) {
                    setCategoryData(data);
                    setFormData({
                        name: data.name,
                        description: data.description || '',
                        is_active: data.is_active,
                        display_order: data.display_order,
                        image: data.image || ''
                    });
                    setImagePreview(data.image || null);
                    
                    // Fetch subcategories for this category
                    fetchSubcategories(data.category_id);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load category');
                showAlert('error', 'Failed to load category', 5000);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchCategory();
    }, [categoryId, showAlert]);
    
    // Fetch subcategories for the category
    const fetchSubcategories = async (catId: number) => {
        try {
            setLoadingSubcategories(true);
            const { data, error } = await getSubcategories(catId);
            
            if (error) {
                throw new Error(error.message);
            }
            
            setSubcategories(data || []);
        } catch (err) {
            console.error('Error fetching subcategories:', err);
        } finally {
            setLoadingSubcategories(false);
        }
    };
    
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
        
        // Show image preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        setImageFile(file);
        
        // Upload image to server via API
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
            setFormData(prev => ({ ...prev, image: result.url }));
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
        setFormData(prev => ({ ...prev, image: '' }));
        
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
    
    const handleEdit = () => {
        setIsEditing(true);
    };
    
    const handleCancelEdit = () => {
        // Reset form data to original values
        if (categoryData) {
            setFormData({
                name: categoryData.name,
                description: categoryData.description || '',
                is_active: categoryData.is_active,
                display_order: categoryData.display_order,
                image: categoryData.image || ''
            });
            setImagePreview(categoryData.image || null);
            setImageFile(null);
            setUploadedImageUrl(null);
        }
        setIsEditing(false);
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        
        try {
            // Validate form data
            if (!formData.name.trim()) {
                showAlert('error', 'Category name is required', 3000);
                setIsSaving(false);
                return;
            }
            
            // Using the user-friendly API endpoint that's already working
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description || null,
                    is_active: formData.is_active,
                    display_order: formData.display_order,
                    image: formData.image || null
                }),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Update failed');
            }
            
            // Update the local state with the updated data
            if (result.data) {
                setCategoryData(result.data);
                setFormData({
                    name: result.data.name,
                    description: result.data.description || '',
                    is_active: result.data.is_active,
                    display_order: result.data.display_order,
                    image: result.data.image || ''
                });
                setImagePreview(result.data.image || null);
            }
            
            showAlert('success', 'Category updated successfully', 3000);
            setIsEditing(false);
            setImageFile(null);
        } catch (error) {
            showAlert('error', error instanceof Error ? error.message : 'Failed to update category', 3000);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = () => {
        setIsDeleting(true);
    };
    
    const confirmDelete = async () => {
        try {
            const { error } = await deleteCategory(categoryId);
            
            if (error) {
                throw new Error(error.message);
            }
            
            showAlert('success', 'Category deleted successfully', 3000);
            router.push('/admin/categories');
        } catch (error) {
            showAlert('error', error instanceof Error ? error.message : 'Failed to delete category', 3000);
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
                    <p className="mt-2 text-gray-500">Loading category...</p>
                </div>
            </div>
        );
    }
    
    if (error || !categoryData) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h2 className="text-xl font-medium text-gray-900">Category not found</h2>
                        <p className="mt-2 text-gray-500">The category you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                        <button 
                            onClick={() => router.push('/admin/categories')}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Categories
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
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-amber-500 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Categories
                </button>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl font-bold">{categoryData.name}</h1>
                        <div className="flex items-center text-sm text-gray-500">
                            <Tag className="h-4 w-4 mr-1" />
                            <span>Category ID: {categoryData.category_id}</span>
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
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Category</h3>
                        <p className="text-gray-500 mb-6">
                            Are you sure you want to delete the category &quot;{categoryData.name}&quot;? This action cannot be undone.
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
                                Delete Category
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Category Image Banner */}
                <div className="relative h-48 md:h-64 bg-gray-200">
                    <Image 
                        src={categoryData.image || 'https://placekitten.com/800/400'} 
                        alt={categoryData.name} 
                        className="object-cover"
                        fill
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            categoryData.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {categoryData.is_active ? 'Active' : 'Inactive'}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Image
                                    </label>
                                    
                                    {imagePreview ? (
                                        <div className="relative rounded-lg overflow-hidden h-64 mb-4">
                                            <img 
                                                src={imagePreview} 
                                                alt="Category preview" 
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
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    disabled={isSaving || isUploadingImage}
                                >
                                    Cancel
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving || isUploadingImage}
                                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                                    {categoryData.description || 'No description provided.'}
                                </p>
                            </motion.div>
                            
                            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Display Order</h3>
                                    <p className="text-gray-900">{categoryData.display_order}</p>
                                </div>
                            </motion.div>
                            
                            {/* Subcategories Section */}
                            <motion.div variants={itemVariants} className="mt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">Subcategories</h2>
                                    <Link href={`/admin/categories/${categoryId}/subcategories/add`}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-amber-500 text-white px-3 py-1 rounded-md flex items-center text-sm"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Subcategory
                                        </motion.button>
                                    </Link>
                                </div>
                                
                                {loadingSubcategories ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-amber-500 mx-auto" />
                                        <p className="mt-2 text-gray-500">Loading subcategories...</p>
                                    </div>
                                ) : subcategories.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">No subcategories found for this category.</p>
                                        <Link href={`/admin/categories/${categoryId}/subcategories/add`}>
                                            <button className="mt-2 text-amber-500 underline">
                                                Add your first subcategory
                                            </button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ID
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Display Order
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {subcategories.map(subcategory => (
                                                    <tr key={subcategory.subcategory_id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {subcategory.subcategory_id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {subcategory.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                subcategory.is_active 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {subcategory.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {subcategory.display_order}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                                            <div className="flex justify-end space-x-2">
                                                                <Link href={`/admin/categories/${categoryId}/subcategories/${subcategory.subcategory_id}`}>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </motion.button>
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
} 