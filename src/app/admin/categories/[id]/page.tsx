'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    Tag, 
    Link as LinkIcon,
    Save,
    X,
    Loader2,
    Plus
} from 'lucide-react';
import { useAlert } from '@/lib/context/alert-context';
import { getCategoryById, updateCategory, deleteCategory, getSubcategories } from '@/lib/supabase';
import { Category, Subcategory } from '@/types';
import Link from 'next/link';

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
    
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
    
    // State for subcategories
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loadingSubcategories, setLoadingSubcategories] = useState(true);
    
    // Fetch category data
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await getCategoryById(categoryId);
                
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
        }
        setIsEditing(false);
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        
        try {
            const { data, error } = await updateCategory(categoryId, {
                name: formData.name,
                description: formData.description || null,
                is_active: formData.is_active,
                display_order: formData.display_order,
                image: formData.image || null
            });
            
            if (error) {
                throw new Error(error.message);
            }
            
            if (data && data[0]) {
                setCategoryData(data[0]);
            }
            
            showAlert('success', 'Category updated successfully', 3000);
            setIsEditing(false);
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
                        <p className="mt-2 text-gray-500">The category you're looking for doesn't exist or has been removed.</p>
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
                            Are you sure you want to delete the category "{categoryData.name}"? This action cannot be undone.
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
                    <img 
                        src={categoryData.image || 'https://placekitten.com/800/400'} 
                        alt={categoryData.name} 
                        className="w-full h-full object-cover"
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
                                    
                                    {/* Image URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Image URL
                                        </label>
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleInputChange}
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
                                        Image Preview
                                    </label>
                                    <div className="mt-1 border rounded-md overflow-hidden">
                                        <img 
                                            src={formData.image || 'https://placekitten.com/800/400'} 
                                            alt="Preview" 
                                            className="w-full h-64 object-cover"
                                        />
                                    </div>
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
                                    disabled={isSaving}
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