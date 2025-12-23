'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, FileText, Download, Calendar, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/providers/alert-provider';
import { getOrders } from '@/services/supabase';

// Define interfaces for order data
interface Order {
    id: string;
    orderId: number;
    customer: string;
    email: string;
    date: string;
    time: string;
    status: string;
    total: string;
    items: number;
    paymentMethod: string;
}

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
const StatusBadge = ({ status, orderId, onStatusUpdate, isUpdating }: { status: string; orderId: number; onStatusUpdate: (orderId: number, newStatus: string) => void; isUpdating: boolean }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    const statusOptions = [
        { value: 'pending', label: 'Pending', style: 'bg-yellow-100 text-yellow-800' },
        { value: 'processing', label: 'Processing', style: 'bg-blue-100 text-blue-800' },
        { value: 'shipped', label: 'Shipped', style: 'bg-purple-100 text-purple-800' },
        { value: 'completed', label: 'Completed', style: 'bg-green-100 text-green-800' },
        { value: 'cancelled', label: 'Cancelled', style: 'bg-red-100 text-red-800' }
    ];

    const handleStatusChange = (newStatus: string) => {
        onStatusUpdate(orderId, newStatus);
        setIsMenuOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative">
            <span
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${getStatusStyles()} ${isUpdating ? 'opacity-50' : ''}`}
                onClick={() => !isUpdating && setIsMenuOpen(!isMenuOpen)}
                title={isUpdating ? "Updating status..." : "Click to change status"}
            >
                {isUpdating ? (
                    <span className="flex items-center">
                        <Loader2 className="animate-spin h-3 w-3 mr-1" />
                        {status}
                    </span>
                ) : (
                    status
                )}
            </span>

            {isMenuOpen && !isUpdating && (
                <div
                    ref={menuRef}
                    className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                >
                    <div className="py-1">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleStatusChange(option.value)}
                                className={`block w-full text-left px-4 py-2 text-sm ${status.toLowerCase() === option.value
                                        ? 'font-bold ' + option.style
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                disabled={isUpdating}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
    const pageSize = 10;

    // Fetch orders from Supabase
    useEffect(() => {
        fetchOrders();
    }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error, count } = await getOrders(currentPage, pageSize);

            if (error) {
                throw new Error(error.message);
            }

            if (data) {
                // Transform data to match our UI format
                const formattedOrders = data.map(order => {
                    // Format date and time
                    const orderDate = new Date(order.order_date);
                    const formattedDate = orderDate.toISOString().split('T')[0];
                    const formattedTime = orderDate.toTimeString().split(' ')[0].substring(0, 5);

                    return {
                        id: order.order_number,
                        orderId: order.order_id,
                        customer: `Customer #${order.user_id}`, // We'll replace this with actual user data in a real app
                        email: "customer@example.com", // Placeholder
                        date: formattedDate,
                        time: formattedTime,
                        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
                        total: `$${order.total_amount.toFixed(2)}`,
                        items: 0, // This would be populated from order items in a real app
                        paymentMethod: "Credit Card" // This would be populated from payment info in a real app
                    };
                });

                setOrders(formattedOrders);
                setTotalOrders(count || 0);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders');
            showAlert('error', 'Failed to load orders', 5000);
        } finally {
            setLoading(false);
        }
    };

    // Hàm cập nhật trạng thái đơn hàng 
    const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            setUpdatingStatus(orderId);

            // Gọi API để cập nhật trạng thái đơn hàng
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update order status');
            }

            // Cập nhật trạng thái trong state
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.orderId === orderId
                        ? { ...order, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) }
                        : order
                )
            );

            showAlert('success', `Order status updated to ${newStatus}`, 2000);
        } catch (error) {
            console.error('Error updating order status:', error);
            showAlert('error', error instanceof Error ? error.message : 'Failed to update order status', 3000);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleExportOrders = () => {
        // Simulate processing time
        showAlert('info', 'Preparing orders for export...', 2000);

        setTimeout(() => {
            // Create a CSV string with order data
            const headers = ['Order ID', 'Date', 'Customer', 'Total', 'Status'];
            let csvContent = headers.join(',') + '\n';

            filteredOrders.forEach(order => {
                const row = [
                    order.id,
                    order.date,
                    order.customer,
                    order.total,
                    order.status
                ];
                csvContent += row.join(',') + '\n';
            });

            // Create a Blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().split('T')[0];

            link.setAttribute('href', url);
            link.setAttribute('download', `orders-export-${timestamp}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showAlert('success', 'Orders exported successfully as CSV', 2000);
        }, 1000);
    };

    const handleInvoiceDownload = (orderId: string) => {
        // Simulate processing time
        showAlert('info', `Generating invoice for order ${orderId}...`, 1500);

        setTimeout(() => {
            // In a real application, this would generate a PDF invoice
            // Here we'll simulate the process

            // Find the order data
            const order = orders.find(o => o.id === orderId);

            if (!order) {
                showAlert('error', `Order ${orderId} not found`, 2000);
                return;
            }

            // Create a simple text representation of an invoice
            const invoiceText = `
INVOICE
==============================
RoabH Mart
123 Commerce Street
Business City, 12345

Order ID: ${order.id}
Date: ${order.date}
Customer: ${order.customer}
Email: ${order.email}

Items:
${Array(order.items || 1).fill(0).map((_, i) => `Item ${i + 1}: Product Name - $${(parseFloat(order.total.replace('$', '')) / (order.items || 1)).toFixed(2)}`).join('\n')}

Subtotal: ${order.total}
Tax (10%): $${(parseFloat(order.total.replace('$', '')) * 0.1).toFixed(2)}
Total: $${(parseFloat(order.total.replace('$', '')) * 1.1).toFixed(2)}

Payment Status: Paid
Shipping Status: ${order.status}

Thank you for your business!
==============================
            `;

            // Create a Blob and download link
            const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.setAttribute('href', url);
            link.setAttribute('download', `invoice-${orderId}.txt`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showAlert('success', `Invoice for order ${orderId} downloaded`, 2000);
        }, 1000);
    };

    // Filter orders based on search query and filters
    const filteredOrders = orders.filter(order => {
        // Search filter
        const matchesSearch =
            searchQuery === '' ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.email && order.email.toLowerCase().includes(searchQuery.toLowerCase()));

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
        let matchesDateRange = true;

        if (selectedDateRange !== 'All Time') {
            const orderDate = new Date(order.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDateRange === 'Today') {
                matchesDateRange = orderDate >= today;
            } else if (selectedDateRange === 'Last 7 Days') {
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                matchesDateRange = orderDate >= lastWeek;
            } else if (selectedDateRange === 'Last 30 Days') {
                const lastMonth = new Date(today);
                lastMonth.setDate(lastMonth.getDate() - 30);
                matchesDateRange = orderDate >= lastMonth;
            } else if (selectedDateRange === 'This Month') {
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                matchesDateRange = orderDate >= firstDayOfMonth;
            } else if (selectedDateRange === 'Last Month') {
                const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const firstDayOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                matchesDateRange = orderDate >= firstDayOfLastMonth && orderDate < firstDayOfThisMonth;
            }
        }

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

    const totalPages = Math.ceil(totalOrders / pageSize);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

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
                        disabled={loading || orders.length === 0}
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

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                        <p className="mt-4 text-gray-500">Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-amber-500 underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
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
                                        <>
                                            {sortedOrders.map((order) => (
                                                <motion.tr
                                                    key={order.id}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="border-b hover:bg-gray-50"
                                                >
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{order.id}</div>
                                                        <div className="text-xs text-gray-500">{order.items || 'N/A'} items</div>
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{order.customer}</div>
                                                        <div className="text-xs text-gray-500">{order.email || 'N/A'}</div>
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
                                                        <StatusBadge status={order.status} orderId={order.orderId} onStatusUpdate={(id, newStatus) => {
                                                            handleUpdateOrderStatus(id, newStatus);
                                                        }} isUpdating={updatingStatus === order.orderId} />
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{order.total}</div>
                                                        <div className="text-xs text-gray-500">{order.paymentMethod || 'N/A'}</div>
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="flex space-x-2">
                                                            <Link href={`/admin/orders/${order.orderId}`}>
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
                                        </>
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

                        {/* Pagination */}
                        <div className="mt-6 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-medium">{sortedOrders.length}</span> of <span className="font-medium">{totalOrders}</span> orders
                            </div>

                            <div className="flex space-x-1">
                                <button
                                    className={`px-3 py-1 border rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                                    // Show current page and adjacent pages
                                    let pageNum = currentPage;
                                    if (totalPages <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage === 1) {
                                        pageNum = i + 1;
                                    } else if (currentPage === totalPages) {
                                        pageNum = totalPages - 2 + i;
                                    } else {
                                        pageNum = currentPage - 1 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            className={`px-3 py-1 border rounded-md ${currentPage === pageNum ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    className={`px-3 py-1 border rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
} 
