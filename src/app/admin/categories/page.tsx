'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useAlert } from '@/lib/context/alert-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCategories, deleteCategory } from '@/lib/supabase';
import { Category } from '@/types';

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

export default function CategoriesPage() {
    const { showAlert } = useAlert();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: number, name: string } | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await getCategories();
                if (error) {
                    throw new Error(error.message);
                }
                setCategories(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load categories');
                showAlert('error', 'Failed to load categories', 5000);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [showAlert]);

    const handleDelete = (id: number, name: string) => {
        setCategoryToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (categoryToDelete) {
            try {
                const { error } = await deleteCategory(categoryToDelete.id);
                if (error) throw new Error(error.message);
                
                showAlert('success', `Category &quot;${categoryToDelete.name}&quot; deleted successfully`, 3000);
                setCategories(categories.filter(cat => cat.category_id !== categoryToDelete.id));
            } catch (_) {
                showAlert('error', 'Failed to delete category', 5000);
            } finally {
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
            }
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    const handleAddNew = () => {
        router.push('/admin/categories/add');
    };

    // Filter categories based on search
    const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-amber-500 text-white px-4 py-2 rounded-md flex items-center"
                    onClick={handleAddNew}
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New
                </motion.button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-amber-400 border-r-transparent"></div>
                        <p className="mt-2 text-gray-500">Loading categories...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <p className="text-red-500">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-2 text-amber-500 underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <motion.table
                        className="min-w-full"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <motion.tr
                                        key={category.category_id}
                                    variants={itemVariants}
                                    className="border-b hover:bg-gray-50"
                                >
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{category.category_id}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{category.name}</td>
                                        <td className="py-4 px-6 text-sm text-gray-500">{category.description || '-'}</td>
                                        <td className="py-4 px-6 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {category.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    <td className="py-4 px-6 text-sm font-medium text-right">
                                        <div className="flex justify-end space-x-2">
                                                <Link href={`/admin/categories/${category.category_id}`}>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="text-amber-600 hover:text-amber-900"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </motion.button>
                                            </Link>
                                                <Link href={`/admin/categories/${category.category_id}`}>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </motion.button>
                                            </Link>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="text-red-600 hover:text-red-900"
                                                    onClick={() => handleDelete(category.category_id, category.name)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </motion.table>
                </div>
                )}
                
                {!loading && !error && filteredCategories.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                        No categories found matching your search criteria
                    </div>
                )}
            </div>
            
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && categoryToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Category</h3>
                        <p className="text-gray-500 mb-6">
                            Are you sure you want to delete the category &quot;{categoryToDelete.name}&quot;? This action cannot be undone.
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
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
} 