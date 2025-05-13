'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, FileText, Download, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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

// Order status badge component
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyles = () => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>
            {status}
        </span>
    );
};

export default function OrdersPage() {
    const { showAlert } = useAlert();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedDateRange, setSelectedDateRange] = useState('All Time');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Mock orders data
    const orders = [
        {
            id: 'ORD-2023-1001',
            customer: 'John Doe',
            email: 'john.doe@example.com',
            date: '2023-11-28',
            time: '14:35',
            status: 'Completed',
            total: '$1,299.00',
            items: 3,
            paymentMethod: 'Credit Card'
        },
        {
            id: 'ORD-2023-1002',
            customer: 'Jane Smith',
            email: 'jane.smith@example.com',
            date: '2023-11-28',
            time: '10:22',
            status: 'Processing',
            total: '$249.99',
            items: 2,
            paymentMethod: 'PayPal'
        },
        {
            id: 'ORD-2023-1003',
            customer: 'Robert Johnson',
            email: 'robert.j@example.com',
            date: '2023-11-27',
            time: '16:45',
            status: 'Shipped',
            total: '$89.95',
            items: 1,
            paymentMethod: 'Credit Card'
        },
        {
            id: 'ORD-2023-1004',
            customer: 'Emily Wilson',
            email: 'emily.w@example.com',
            date: '2023-11-27',
            time: '09:10',
            status: 'Pending',
            total: '$459.90',
            items: 4,
            paymentMethod: 'Bank Transfer'
        },
        {
            id: 'ORD-2023-1005',
            customer: 'Michael Brown',
            email: 'michael.b@example.com',
            date: '2023-11-26',
            time: '13:20',
            status: 'Cancelled',
            total: '$129.50',
            items: 2,
            paymentMethod: 'PayPal'
        },
        {
            id: 'ORD-2023-1006',
            customer: 'Sarah Davis',
            email: 'sarah.d@example.com',
            date: '2023-11-26',
            time: '11:05',
            status: 'Completed',
            total: '$349.95',
            items: 3,
            paymentMethod: 'Credit Card'
        },
        {
            id: 'ORD-2023-1007',
            customer: 'David Miller',
            email: 'david.m@example.com',
            date: '2023-11-25',
            time: '15:30',
            status: 'Processing',
            total: '$74.99',
            items: 1,
            paymentMethod: 'Credit Card'
        },
        {
            id: 'ORD-2023-1008',
            customer: 'Lisa Taylor',
            email: 'lisa.t@example.com',
            date: '2023-11-25',
            time: '08:45',
            status: 'Shipped',
            total: '$199.00',
            items: 2,
            paymentMethod: 'PayPal'
        }
    ];

    const handleViewOrder = (orderId: string) => {
        showAlert('info', `Viewing order ${orderId}`, 2000);
    };

    const handleExportOrders = () => {
        showAlert('success', 'Orders exported successfully', 2000);
    };

    const handleInvoiceDownload = (orderId: string) => {
        showAlert('success', `Invoice for order ${orderId} downloaded`, 2000);
    };

    // Filter orders based on search query and filters
    const filteredOrders = orders.filter(order => {
        // Search filter
        const matchesSearch =
            searchQuery === '' ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const matchesStatus =
            selectedStatus === 'All' ||
            order.status.toLowerCase() === selectedStatus.toLowerCase();

        // Payment method filter
        const matchesPayment =
            selectedPaymentMethod === 'All' ||
            order.paymentMethod === selectedPaymentMethod;

        // Date range filter - simplified for demo
        // In a real app, you would implement proper date filtering
        const matchesDateRange = true;

        return matchesSearch && matchesStatus && matchesPayment && matchesDateRange;
    });

    // Sort orders
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.date + 'T' + b.time) > new Date(a.date + 'T' + a.time) ? 1 : -1;
        } else if (sortBy === 'oldest') {
            return new Date(a.date + 'T' + a.time) > new Date(b.date + 'T' + b.time) ? 1 : -1;
        } else if (sortBy === 'highest') {
            return parseFloat(b.total.replace('$', '').replace(',', '')) - parseFloat(a.total.replace('$', '').replace(',', ''));
        } else if (sortBy === 'lowest') {
            return parseFloat(a.total.replace('$', '').replace(',', '')) - parseFloat(b.total.replace('$', '').replace(',', ''));
        }
        return 0;
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Order Management</h1>
                    <p className="text-gray-500 text-sm">View and manage customer orders</p>
                </div>

                <div className="flex space-x-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center"
                        onClick={handleExportOrders}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </motion.button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                {/* Search and Filter Row */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search orders by ID, customer name or email..."
                            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center">
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
                                <option>Completed</option>
                                <option>Processing</option>
                                <option>Shipped</option>
                                <option>Pending</option>
                                <option>Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <select
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                value={selectedDateRange}
                                onChange={(e) => setSelectedDateRange(e.target.value)}
                            >
                                <option>All Time</option>
                                <option>Today</option>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Month</option>
                                <option>Last Month</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                value={selectedPaymentMethod}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            >
                                <option>All</option>
                                <option>Credit Card</option>
                                <option>PayPal</option>
                                <option>Bank Transfer</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                            <select
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Amount</option>
                                <option value="lowest">Lowest Amount</option>
                            </select>
                        </div>
                    </motion.div>
                )}

                {/* Orders Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedOrders.length > 0 ? (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="contents"
                                >
                                    {sortedOrders.map((order, index) => (
                                        <motion.tr
                                            key={order.id}
                                            variants={itemVariants}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{order.id}</div>
                                                <div className="text-xs text-gray-500">{order.items} items</div>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{order.customer}</div>
                                                <div className="text-xs text-gray-500">{order.email}</div>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                                                    <span className="text-sm text-gray-900">{order.date}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                                    <span>{order.time}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{order.total}</div>
                                                <div className="text-xs text-gray-500">{order.paymentMethod}</div>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <Link href={`/admin/orders/${order.id}`}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="p-1 bg-amber-100 rounded text-amber-600"
                                                            title="View Order"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </motion.button>
                                                    </Link>

                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-1 bg-gray-100 rounded text-gray-600"
                                                        title="Download Invoice"
                                                        onClick={() => handleInvoiceDownload(order.id)}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </motion.div>
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        No orders found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - simplified for demo */}
                <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">{sortedOrders.length}</span> of <span className="font-medium">{orders.length}</span> orders
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
                            3
                        </button>
                        <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 