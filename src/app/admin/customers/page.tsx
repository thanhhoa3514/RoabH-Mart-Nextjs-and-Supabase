'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, 
    Filter, 
    Eye, 
    Mail, 
    Phone, 
    Calendar, 

    ChevronDown, 
    ChevronUp, 
    User,
    MapPin,
    Plus,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/lib/context/alert-context';
import { getCustomers, searchCustomers } from '@/lib/supabase/customers/customers.model';
import { DbCustomer } from '@/types/user/customer.model';

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

// Customer card component
const CustomerCard = ({ customer }: { 
    customer: DbCustomer
}) => {
    // Format name for initials
    const initials = customer.first_name && customer.last_name 
        ? `${customer.first_name[0]}${customer.last_name[0]}` 
        : customer.username.substring(0, 2).toUpperCase();
    
    // Format display name
    const displayName = customer.first_name && customer.last_name 
        ? `${customer.first_name} ${customer.last_name}` 
        : customer.username;

    // Format join date
    const joinDate = new Date(customer.created_at).toLocaleDateString();
    
    return (
        <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-lg mr-4">
                            {initials}
                        </div>
                        <div>
                            <h3 className="font-medium text-lg">{displayName}</h3>
                            <div className="flex items-center text-sm text-gray-500">
                                <Mail className="h-3 w-3 mr-1" />
                                <span>{customer.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                        customer.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                        {customer.is_active ? 'Active' : 'Inactive'}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{customer.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span>Joined {joinDate}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{customer.city ? `${customer.city}, ${customer.country || ''}` : 'No address provided'}</span>
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-end">
                    <Link href={`/admin/customers/${customer.user_id}`}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-amber-100 text-amber-600 px-4 py-2 rounded-md text-sm flex items-center"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                        </motion.button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default function CustomersPage() {
    const { showAlert } = useAlert();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedJoinDate, setSelectedJoinDate] = useState('All Time');
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
    
    // Pagination state
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [totalCustomers, setTotalCustomers] = useState(0);
    
    // Data fetching state
    const [customers, setCustomers] = useState<DbCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch customers data
    useEffect(() => {
        async function fetchCustomers() {
            setLoading(true);
            setError(null);
            
            try {
                let result;
                
                if (searchQuery) {
                    result = await searchCustomers(searchQuery, page, pageSize);
                } else {
                    result = await getCustomers(page, pageSize);
                }
                
                if (result.error) {
                    throw new Error(result.error.message);
                }
                
                setCustomers(result.data || []);
                setTotalCustomers(result.count || 0);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch customers');
                showAlert('error', 'Failed to fetch customers', 3000);
            } finally {
                setLoading(false);
            }
        }
        
        fetchCustomers();
    }, [page, pageSize, searchQuery, showAlert]);

    const handleAddCustomer = () => {
        showAlert('info', 'Add new customer functionality would be implemented here', 2000);
    };

    // Filter customers based on search query and filters
    const filteredCustomers = customers.filter(customer => {
        // Status filter
        if (selectedStatus !== 'All') {
            const isActive = selectedStatus === 'Active';
            if (customer.is_active !== isActive) return false;
        }
        
        // Join date filter - simplified for demo
        if (selectedJoinDate !== 'All Time') {
            const customerDate = new Date(customer.created_at);
            const now = new Date();
            
            if (selectedJoinDate === 'Last 30 Days') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(now.getDate() - 30);
                if (customerDate < thirtyDaysAgo) return false;
            } else if (selectedJoinDate === 'Last 90 Days') {
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(now.getDate() - 90);
                if (customerDate < ninetyDaysAgo) return false;
            } else if (selectedJoinDate === 'This Year') {
                const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
                if (customerDate < firstDayOfYear) return false;
            }
        }
        
        return true;
    });

    // Sort customers
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.created_at) > new Date(a.created_at) ? 1 : -1;
        } else if (sortBy === 'oldest') {
            return new Date(a.created_at) > new Date(b.created_at) ? 1 : -1;
        }
        return 0;
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Customer Management</h1>
                    <p className="text-gray-500 text-sm">View and manage your customer base</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-amber-500 text-white px-4 py-2 rounded-md flex items-center"
                    onClick={handleAddCustomer}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                </motion.button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                {/* Search and Filter Row */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="flex border rounded-md overflow-hidden">
                            <button 
                                className={`px-3 py-1 ${viewType === 'grid' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                                onClick={() => setViewType('grid')}
                            >
                                Grid
                            </button>
                            <button 
                                className={`px-3 py-1 ${viewType === 'list' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                                onClick={() => setViewType('list')}
                            >
                                List
                            </button>
                        </div>
                        
                        <button 
                            className="flex items-center text-gray-600 hover:text-amber-500"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                            {isFilterOpen ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                            ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Expanded Filters */}
                {isFilterOpen && (
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option>All</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                            <select
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                value={selectedJoinDate}
                                onChange={(e) => setSelectedJoinDate(e.target.value)}
                            >
                                <option>All Time</option>
                                <option>Last 30 Days</option>
                                <option>Last 90 Days</option>
                                <option>This Year</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                            <select
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest Customers</option>
                                <option value="oldest">Oldest Customers</option>
                            </select>
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                        <span className="ml-2 text-gray-500">Loading customers...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md my-4">
                        <p className="font-medium">Failed to load customers</p>
                        <p className="text-sm">{error}</p>
                        <button 
                            className="mt-2 text-sm bg-red-100 px-3 py-1 rounded-md hover:bg-red-200"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && sortedCustomers.length === 0 && (
                    <div className="text-center py-12">
                        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">No customers found</h3>
                        <p className="text-gray-500 mt-1">
                            {searchQuery ? 'Try a different search term' : 'Add your first customer to get started'}
                        </p>
                    </div>
                )}

                {/* Customers Grid/List View */}
                {!loading && !error && sortedCustomers.length > 0 && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={viewType === 'grid' 
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                            : "space-y-4"
                        }
                    >
                        {viewType === 'grid' ? (
                            // Grid view
                            sortedCustomers.map((customer) => (
                                <CustomerCard 
                                    key={customer.user_id} 
                                    customer={customer} 
                                />
                            ))
                        ) : (
                            // List view - using proper table structure
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Email
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Location
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Joined
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Status
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedCustomers.map((customer) => (
                                        <tr key={customer.user_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold mr-4">
                                                        {customer.first_name && customer.last_name 
                                                            ? `${customer.first_name[0]}${customer.last_name[0]}` 
                                                            : customer.username.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">
                                                            {customer.first_name && customer.last_name 
                                                                ? `${customer.first_name} ${customer.last_name}` 
                                                                : customer.username}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className="text-sm">{customer.email}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className="text-sm">{customer.city ? `${customer.city}, ${customer.country || ''}` : 'No address provided'}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className="text-sm">{new Date(customer.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className={`px-2 py-1 text-xs inline-block rounded-full ${
                                                    customer.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {customer.is_active ? 'Active' : 'Inactive'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <Link href={`/admin/customers/${customer.user_id}`}>
                                                    <button className="text-amber-600 hover:text-amber-800">
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </motion.div>
                )}
                
                {/* Pagination */}
                {!loading && !error && totalCustomers > 0 && (
                    <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCustomers)} of {totalCustomers} customers
                        </div>
                        <div className="flex space-x-2">
                            <button 
                                className={`px-3 py-1 rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <button 
                                className={`px-3 py-1 rounded-md ${page * pageSize >= totalCustomers ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}
                                onClick={() => setPage(p => p + 1)}
                                disabled={page * pageSize >= totalCustomers}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 