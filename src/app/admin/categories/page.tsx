'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAlert } from '@/lib/context/alert-context';

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
    const [searchQuery, setSearchQuery] = useState('');

    // Mock categories data
    const categories = [
        { id: 1, name: 'Electronics', products: 120, createdAt: '2023-01-15' },
        { id: 2, name: 'Clothing', products: 85, createdAt: '2023-02-20' },
        { id: 3, name: 'Home & Garden', products: 64, createdAt: '2023-03-10' },
        { id: 4, name: 'Books', products: 42, createdAt: '2023-04-05' },
        { id: 5, name: 'Sports', products: 38, createdAt: '2023-05-12' },
    ];

    const handleDelete = (id: number, name: string) => {
        showAlert('info', `Category "${name}" would be deleted in a real app`, 3000);
    };

    const handleEdit = (id: number, name: string) => {
        showAlert('success', `Editing category "${name}"`, 3000);
    };

    const handleAddNew = () => {
        showAlert('info', 'Adding a new category', 3000);
    };

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
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <motion.tr
                                    key={category.id}
                                    variants={itemVariants}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{category.id}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{category.name}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{category.products}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{category.createdAt}</td>
                                    <td className="py-4 px-6 text-sm font-medium text-right">
                                        <div className="flex justify-end space-x-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="text-blue-600 hover:text-blue-900"
                                                onClick={() => handleEdit(category.id, category.name)}
                                            >
                                                <Edit className="h-5 w-5" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="text-red-600 hover:text-red-900"
                                                onClick={() => handleDelete(category.id, category.name)}
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
            </div>
        </div>
    );
} 