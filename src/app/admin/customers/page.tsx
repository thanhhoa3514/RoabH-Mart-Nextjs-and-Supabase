'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, 
    Filter, 
    Eye, 
    Mail, 
    Phone, 
    Calendar, 
    ShoppingBag, 
    ChevronDown, 
    ChevronUp, 
    User,
    MapPin,
    CreditCard,
    Tag,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/lib/context/alert-context';

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
const CustomerCard = ({ customer, onView }: { 
    customer: any, 
    onView: (id: number) => void 
}) => {
    return (
        <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-lg mr-4">
                            {customer.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                            <h3 className="font-medium text-lg">{customer.name}</h3>
                            <div className="flex items-center text-sm text-gray-500">
                                <Mail className="h-3 w-3 mr-1" />
                                <span>{customer.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                        customer.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                        {customer.status}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span>Joined {customer.joinDate}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <ShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{customer.orders} orders</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <span>${customer.totalSpent}</span>
                    </div>
                </div>
                
                <div className="flex items-center mt-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{customer.location}</span>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                    {customer.tags.map((tag: string, index: number) => (
                        <span 
                            key={index} 
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs flex items-center"
                        >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                        </span>
                    ))}
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-end">
                    <Link href={`/admin/customers/${customer.id}`}>
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
    const [selectedSpendRange, setSelectedSpendRange] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
    
    // Mock customers data
    const customers = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            location: 'New York, USA',
            joinDate: '2023-08-15',
            status: 'Active',
            orders: 12,
            totalSpent: '1,549.99',
            lastOrder: '2023-11-20',
            tags: ['Loyal', 'Premium']
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 (555) 987-6543',
            location: 'Los Angeles, USA',
            joinDate: '2023-09-22',
            status: 'Active',
            orders: 8,
            totalSpent: '879.50',
            lastOrder: '2023-11-15',
            tags: ['New Customer']
        },
        {
            id: 3,
            name: 'Robert Johnson',
            email: 'robert.j@example.com',
            phone: '+1 (555) 234-5678',
            location: 'Chicago, USA',
            joinDate: '2023-05-10',
            status: 'Inactive',
            orders: 3,
            totalSpent: '299.95',
            lastOrder: '2023-07-05',
            tags: ['Inactive']
        },
        {
            id: 4,
            name: 'Emily Wilson',
            email: 'emily.w@example.com',
            phone: '+1 (555) 876-5432',
            location: 'Miami, USA',
            joinDate: '2023-10-05',
            status: 'Active',
            orders: 5,
            totalSpent: '459.90',
            lastOrder: '2023-11-18',
            tags: ['New Customer']
        },
        {
            id: 5,
            name: 'Michael Brown',
            email: 'michael.b@example.com',
            phone: '+1 (555) 345-6789',
            location: 'Seattle, USA',
            joinDate: '2023-04-18',
            status: 'Active',
            orders: 20,
            totalSpent: '2,349.75',
            lastOrder: '2023-11-22',
            tags: ['Loyal', 'Premium', 'Wholesale']
        },
        {
            id: 6,
            name: 'Sarah Davis',
            email: 'sarah.d@example.com',
            phone: '+1 (555) 765-4321',
            location: 'Boston, USA',
            joinDate: '2023-07-30',
            status: 'Active',
            orders: 7,
            totalSpent: '689.45',
            lastOrder: '2023-11-10',
            tags: ['Returning']
        },
        {
            id: 7,
            name: 'David Miller',
            email: 'david.m@example.com',
            phone: '+1 (555) 456-7890',
            location: 'Denver, USA',
            joinDate: '2023-03-12',
            status: 'Inactive',
            orders: 2,
            totalSpent: '149.99',
            lastOrder: '2023-05-20',
            tags: ['Inactive']
        },
        {
            id: 8,
            name: 'Lisa Taylor',
            email: 'lisa.t@example.com',
            phone: '+1 (555) 654-3210',
            location: 'Austin, USA',
            joinDate: '2023-11-01',
            status: 'Active',
            orders: 1,
            totalSpent: '79.99',
            lastOrder: '2023-11-05',
            tags: ['New Customer']
        }
    ];

    const handleViewCustomer = (customerId: number) => {
        showAlert('info', `Viewing customer profile ${customerId}`, 2000);
    };

    const handleAddCustomer = () => {
        showAlert('info', 'Add new customer functionality would be implemented here', 2000);
    };

    // Filter customers based on search query and filters
    const filteredCustomers = customers.filter(customer => {
        // Search filter
        const matchesSearch = 
            searchQuery === '' || 
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery);
        
        // Status filter
        const matchesStatus = 
            selectedStatus === 'All' || 
            customer.status === selectedStatus;
        
        // Spend range filter - simplified for demo
        let matchesSpend = true;
        const totalSpent = parseFloat(customer.totalSpent.replace(',', ''));
        
        if (selectedSpendRange === 'Under $100') {
            matchesSpend = totalSpent < 100;
        } else if (selectedSpendRange === '$100 - $500') {
            matchesSpend = totalSpent >= 100 && totalSpent <= 500;
        } else if (selectedSpendRange === '$500 - $1000') {
            matchesSpend = totalSpent > 500 && totalSpent <= 1000;
        } else if (selectedSpendRange === 'Over $1000') {
            matchesSpend = totalSpent > 1000;
        }
        
        // Join date filter - simplified for demo
        // In a real app, you would implement proper date filtering
        const matchesJoinDate = true;
        
        return matchesSearch && matchesStatus && matchesSpend && matchesJoinDate;
    });

    // Sort customers
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.joinDate) > new Date(a.joinDate) ? 1 : -1;
        } else if (sortBy === 'oldest') {
            return new Date(a.joinDate) > new Date(b.joinDate) ? 1 : -1;
        } else if (sortBy === 'highest-spend') {
            return parseFloat(b.totalSpent.replace(',', '')) - parseFloat(a.totalSpent.replace(',', ''));
        } else if (sortBy === 'most-orders') {
            return b.orders - a.orders;
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Spend</label>
                            <select
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                value={selectedSpendRange}
                                onChange={(e) => setSelectedSpendRange(e.target.value)}
                            >
                                <option>All</option>
                                <option>Under $100</option>
                                <option>$100 - $500</option>
                                <option>$500 - $1000</option>
                                <option>Over $1000</option>
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
                                <option value="highest-spend">Highest Spend</option>
                                <option value="most-orders">Most Orders</option>
                            </select>
                        </div>
                    </motion.div>
                )}

                {/* Customers Grid/List View */}
                {sortedCustomers.length > 0 ? (
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
                                    key={customer.id} 
                                    customer={customer} 
                                    onView={handleViewCustomer} 
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
                                            Orders
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Total Spent
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
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold mr-4">
                                                        {customer.name.split(' ').map((n: string) => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{customer.name}</h3>
                                                        <div className="text-sm text-gray-500">{customer.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className="text-sm font-medium">{customer.orders}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className="text-sm font-medium">${customer.totalSpent}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className="text-sm">{customer.joinDate}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className={`px-2 py-1 text-xs rounded-full inline-block ${
                                                    customer.status === 'Active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {customer.status}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <Link href={`/admin/customers/${customer.id}`}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-amber-100 text-amber-600 px-3 py-1 rounded-md text-sm flex items-center ml-auto"
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </motion.button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </motion.div>
                ) : (
                    <div className="py-12 text-center text-gray-500">
                        No customers found matching your criteria
                    </div>
                )}

                {/* Pagination - simplified for demo */}
                {sortedCustomers.length > 0 && (
                    <div className="mt-8 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{sortedCustomers.length}</span> of <span className="font-medium">{customers.length}</span> customers
                        </div>
                        
                        <div className="flex space-x-1">
                            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">
                                Previous
                            </button>
                            <button className="px-3 py-1 border rounded-md bg-amber-500 text-white">
                                1
                            </button>
                            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">
                                2
                            </button>
                            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 