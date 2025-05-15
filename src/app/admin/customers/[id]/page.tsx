'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    ShoppingBag, 
    CreditCard, 
    Edit, 
    Trash2, 
    Home,
    MessageSquare,
    Send,
    Loader2,
    Plus,
    Eye
} from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/lib/context/alert-context';
import { getCustomerById, getCustomerStats, getCustomerOrders, getCustomerAddresses } from '@/lib/supabase/customers/customers.model';
import { DbCustomer } from '@/types/user/customer.model';

// Define interfaces for the data types
interface Order {
    order_id: string;
    order_date: string;
    item_count: number;
    total_amount: number;
    status: string;
}

interface Address {
    address_id: string;
    address_type: string;
    is_default: boolean;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

// interface PaymentMethod {
//     brand: string;
//     isDefault: boolean;
//     last4: string;
//     expiryDate: string;
// }

// interface Note {
//     author: string;
//     date: string;
//     content: string;
// }

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

// Tab component
const Tab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 font-medium text-sm ${
                active 
                    ? 'border-b-2 border-amber-500 text-amber-600' 
                    : 'text-gray-500 hover:text-amber-500'
            }`}
        >
            {label}
        </button>
    );
};

// Order item component
const OrderItem = ({ order }: { order: Order }) => {
    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="py-4 px-3">
                <div className="flex items-center">
                    <Link href={`/admin/orders/${order.order_id}`}>
                        <span className="font-medium text-amber-600">{order.order_id}</span>
                    </Link>
                </div>
            </td>
            <td className="py-4 px-3 text-sm text-gray-500">
                {order.order_date}
            </td>
            <td className="py-4 px-3 text-sm">
                {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
            </td>
            <td className="py-4 px-3 text-sm font-medium">
                ${order.total_amount}
            </td>
            <td className="py-4 px-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    order.status === 'Delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'Processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                }`}>
                    {order.status}
                </div>
            </td>
            <td className="py-4 px-3 text-right">
                <Link href={`/admin/orders/${order.order_id}`}>
                    <button className="text-sm text-amber-600 hover:text-amber-500">
                        View Details
                    </button>
                </Link>
            </td>
        </tr>
    );
};

// Address card component
// const AddressCard = ({ address }: { address: Address }) => {
//     return (
//         <motion.div 
//             variants={itemVariants}
//             className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
//         >
//             <div className="flex justify-between items-start mb-2">
//                 <div className="flex items-center">
//                     <Home className="h-4 w-4 text-gray-400 mr-2" />
//                     <h3 className="font-medium">{address.address_type} Address</h3>
//                 </div>
//                 {address.is_default && (
//                     <span className="bg-amber-100 text-amber-600 text-xs px-2 py-1 rounded-full">
//                         Default
//                     </span>
//                 )}
//             </div>
            
//             <div className="text-sm text-gray-600 space-y-1">
//                 <p>{address.street_address}</p>
//                 <p>{address.city}, {address.state} {address.postal_code}</p>
//                 <p>{address.country}</p>
//             </div>
            
//             <div className="mt-3 flex justify-end space-x-2">
//                 <button className="text-gray-500 hover:text-amber-500">
//                     <Edit className="h-4 w-4" />
//                 </button>
//             </div>
//         </motion.div>
//     );
// };

// // Payment method card component
// const PaymentMethodCard = ({ paymentMethod }: { paymentMethod: PaymentMethod }) => {
//     return (
//         <motion.div 
//             variants={itemVariants}
//             className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
//         >
//             <div className="flex justify-between items-start mb-2">
//                 <div className="flex items-center">
//                     <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
//                     <h3 className="font-medium">{paymentMethod.brand}</h3>
//                 </div>
//                 {paymentMethod.isDefault && (
//                     <span className="bg-amber-100 text-amber-600 text-xs px-2 py-1 rounded-full">
//                         Default
//                     </span>
//                 )}
//             </div>
            
//             <div className="text-sm text-gray-600 space-y-1">
//                 <p>•••• •••• •••• {paymentMethod.last4}</p>
//                 <p>Expires {paymentMethod.expiryDate}</p>
//             </div>
            
//             <div className="mt-3 flex justify-end space-x-2">
//                 <button className="text-gray-500 hover:text-amber-500">
//                     <Edit className="h-4 w-4" />
//                 </button>
//             </div>
//         </motion.div>
//     );
// };

// // Note item component
// const NoteItem = ({ note }: { note: Note }) => {
//     return (
//         <motion.div 
//             variants={itemVariants}
//             className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
//         >
//             <div className="flex justify-between items-start mb-2">
//                 <div className="flex items-start">
//                     <MessageSquare className="h-4 w-4 text-gray-400 mt-1 mr-2" />
//                     <div>
//                         <div className="flex items-center">
//                             <span className="font-medium">{note.author}</span>
//                             <span className="mx-2 text-gray-300">•</span>
//                             <span className="text-sm text-gray-500">{note.date}</span>
//                         </div>
//                         <p className="text-sm mt-1">{note.content}</p>
//                     </div>
//                 </div>
//             </div>
//         </motion.div>
//     );
// };

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { showAlert } = useAlert();
    const [activeTab, setActiveTab] = useState('overview');
    const [newNote, setNewNote] = useState('');
    
    // Get customer ID from URL params
    const customerId = typeof params.id === 'string' ? parseInt(params.id, 10) : 0;
    
    // State for customer data
    const [customer, setCustomer] = useState<DbCustomer | null>(null);
    const [customerStats, setCustomerStats] = useState<{
        totalOrders: number;
        totalSpent: number;
        lastOrderDate: string | null;
    } | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch customer data
    useEffect(() => {
        async function fetchCustomerData() {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch customer details
                const { data: customerData, error: customerError } = await getCustomerById(customerId);
                
                if (customerError) throw new Error(customerError.message);
                if (!customerData) throw new Error('Customer not found');
                
                setCustomer(customerData);
                
                // Fetch customer stats
                const { data: statsData, error: statsError } = await getCustomerStats(customerId);
                
                if (statsError) throw new Error(statsError.message);
                setCustomerStats(statsData);
                
                // Fetch customer orders
                const { data: ordersData, error: ordersError } = await getCustomerOrders(customerId);
                
                if (ordersError) throw new Error(ordersError.message);
                setOrders(ordersData || []);
                
                // Fetch customer addresses
                const { data: addressesData, error: addressesError } = await getCustomerAddresses(customerId);
                
                if (addressesError) {
                    console.error('Error fetching addresses:', addressesError);
                } else {
                    setAddresses(addressesData || []);
                    console.log('Fetched addresses:', addressesData);
                }
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch customer data');
                showAlert('error', 'Failed to fetch customer data', 3000);
            } finally {
                setLoading(false);
            }
        }
        
        if (customerId) {
            fetchCustomerData();
        }
    }, [customerId, showAlert]);
    
    const handleEdit = () => {
        showAlert('info', 'Edit customer functionality would be implemented here', 2000);
    };
    
    const handleDelete = () => {
        showAlert('warning', 'Delete customer functionality would be implemented here', 2000);
    };
    
    const handleAddNote = () => {
        if (newNote.trim()) {
            showAlert('success', 'Note added successfully', 2000);
            setNewNote('');
        } else {
            showAlert('error', 'Please enter a note', 2000);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 text-amber-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading customer data...</p>
            </div>
        );
    }

    // Error state
    if (error || !customer) {
        return (
            <div className="p-6">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-amber-500 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Customers
                </button>
                
                <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-2">Error Loading Customer</h2>
                    <p>{error || 'Customer not found'}</p>
                    <button 
                        className="mt-4 px-4 py-2 bg-red-100 rounded-md hover:bg-red-200 text-red-700"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Format name for initials
    const initials = customer.first_name && customer.last_name 
        ? `${customer.first_name[0]}${customer.last_name[0]}` 
        : customer.username.substring(0, 2).toUpperCase();
    
    // Format display name
    const displayName = customer.first_name && customer.last_name 
        ? `${customer.first_name} ${customer.last_name}` 
        : customer.username;

    // Format address for display from customer object
    const customerAddress = [
        customer.address,
        customer.city,
        customer.state,
        customer.postal_code,
        customer.country
    ].filter(Boolean).join(', ');
    
    // Check if we have addresses from the addresses table
    const hasAddressesFromTable = addresses && addresses.length > 0;
    
    // Debug address information
    console.log('Customer address data:', {
        customerObj: {
            address: customer.address,
            city: customer.city,
            state: customer.state,
            postal_code: customer.postal_code,
            country: customer.country,
            formattedAddress: customerAddress
        },
        addressesFromTable: addresses
    });

    return (
        <div className="p-6">
            {/* Back button and header */}
            <div className="mb-6">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-amber-500 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Customers
                </button>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl font-bold flex items-center">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold mr-3">
                                {initials}
                            </div>
                            {displayName}
                        </h1>
                        <p className="text-gray-500 text-sm">Customer ID: {customer.user_id}</p>
                    </div>
                    
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
                </div>
            </div>
            
            {/* Customer status card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 mb-1">Status</span>
                        <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                                customer.is_active ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <span className="font-medium">{customer.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 mb-1">Member Since</span>
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">{new Date(customer.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 mb-1">Total Orders</span>
                        <div className="flex items-center">
                            <ShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">{customerStats?.totalOrders || 0}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 mb-1">Total Spent</span>
                        <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">${customerStats?.totalSpent.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 mb-1">Email</span>
                            <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <a href={`mailto:${customer.email}`} className="text-amber-600 hover:underline">
                                    {customer.email}
                                </a>
                            </div>
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 mb-1">Phone</span>
                            <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                {customer.phone ? (
                                <a href={`tel:${customer.phone}`} className="text-amber-600 hover:underline">
                                    {customer.phone}
                                </a>
                                ) : (
                                    <span className="text-gray-500">Not provided</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 mb-1">Location</span>
                            <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                {customerAddress ? (
                                    <span>{customerAddress}</span>
                                ) : hasAddressesFromTable && addresses[0] ? (
                                    <span>
                                        {[
                                            addresses[0].city,
                                            addresses[0].state,
                                            addresses[0].country
                                        ].filter(Boolean).join(', ')}
                                    </span>
                                ) : (
                                    <span className="text-gray-500">No address provided</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b">
                    <div className="flex overflow-x-auto">
                        <Tab 
                            label="Overview" 
                            active={activeTab === 'overview'} 
                            onClick={() => setActiveTab('overview')} 
                        />
                        <Tab 
                            label="Orders" 
                            active={activeTab === 'orders'} 
                            onClick={() => setActiveTab('orders')} 
                        />
                        <Tab 
                            label="Address" 
                            active={activeTab === 'address'} 
                            onClick={() => setActiveTab('address')} 
                        />
                        <Tab 
                            label="Notes" 
                            active={activeTab === 'notes'} 
                            onClick={() => setActiveTab('notes')} 
                        />
                    </div>
                </div>
                
                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Customer Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Username</label>
                                            <p>{customer.username}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                                            <p>{customer.first_name && customer.last_name 
                                                ? `${customer.first_name} ${customer.last_name}` 
                                                : 'Not provided'}</p>
                                            </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Email</label>
                                            <p>{customer.email}</p>
                                            </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Phone</label>
                                            <p>{customer.phone || 'Not provided'}</p>
                                        </div>
                                                </div>
                                            </div>
                                
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Address</h3>
                                    {customerAddress ? (
                                        <div className="border rounded-lg p-4">
                                            <p>{customer.address}</p>
                                            <p>{customer.city}, {customer.state} {customer.postal_code}</p>
                                            <p>{customer.country}</p>
                                            </div>
                                    ) : hasAddressesFromTable && addresses[0] ? (
                                        <div className="border rounded-lg p-4">
                                            <p>{addresses[0].street_address}</p>
                                            <p>{addresses[0].city}, {addresses[0].state} {addresses[0].postal_code}</p>
                                            <p>{addresses[0].country}</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No address information provided</p>
                                    )}
                                                </div>
                                            </div>
                            
                            <div className="mt-8">
                                <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
                                {orders.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Order ID
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Items
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Total
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {orders.slice(0, 5).map((order) => (
                                                    <OrderItem key={order.order_id} order={{
                                                        order_id: order.order_id,
                                                        order_date: new Date(order.order_date).toLocaleDateString(),
                                                        item_count: order.item_count || 0,
                                                        total_amount: order.total_amount,
                                                        status: order.status
                                                    }} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No order history found</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3 className="text-lg font-medium mb-4">Order History</h3>
                            {orders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Items
                                                </th>
                                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr key={order.order_id} className="border-b hover:bg-gray-50">
                                                    <td className="py-4 px-3">
                                                        <div className="flex items-center">
                                                            <Link href={`/admin/orders/${order.order_id}`}>
                                                                <span className="font-medium text-amber-600">#{order.order_id}</span>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-3 text-sm text-gray-500">
                                                        {new Date(order.order_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-3 text-sm">
                                                        {order.item_count} items
                                                    </td>
                                                    <td className="py-4 px-3 text-sm font-medium">
                                                        ${order.total_amount.toFixed(2)}
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                                                            order.status === 'Delivered' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : order.status === 'Processing'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {order.status}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-3 text-right">
                                                        <Link href={`/admin/orders/${order.order_id}`}>
                                                            <button className="text-amber-600 hover:text-amber-800">
                                                                <Eye className="h-5 w-5" />
                                                            </button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700">No orders yet</h3>
                                    <p className="text-gray-500 mt-1">This customer hasn&apos;t placed any orders</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                    
                    {/* Address Tab */}
                    {activeTab === 'address' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Address Information</h3>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-amber-100 text-amber-600 px-3 py-1 rounded-md text-sm flex items-center"
                                    onClick={() => showAlert('info', 'Add address functionality would be implemented here', 2000)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Address
                                </motion.button>
                            </div>
                            
                            {hasAddressesFromTable ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {addresses.map((address) => (
                                        <div key={address.address_id} className="border rounded-lg p-6 relative">
                                            <div className="absolute top-4 right-4 flex space-x-2">
                                                <button className="text-gray-400 hover:text-amber-500">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                            </div>
                                            <div className="flex items-start mb-4">
                                                <Home className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                                                <div>
                                                    <h4 className="font-medium">{address.address_type} Address</h4>
                                                    {address.is_default && (
                                                        <p className="text-sm text-gray-500">Default</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-8">
                                                <p>{address.street_address}</p>
                                                <p>{address.city}, {address.state} {address.postal_code}</p>
                                                <p>{address.country}</p>
                                            </div>
                            </div>
                                ))}
                            </div>
                            ) : customerAddress ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border rounded-lg p-6 relative">
                                        <div className="absolute top-4 right-4 flex space-x-2">
                                            <button className="text-gray-400 hover:text-amber-500">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-start mb-4">
                                            <Home className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                                            <div>
                                                <h4 className="font-medium">Primary Address</h4>
                                                <p className="text-sm text-gray-500">Shipping & Billing</p>
                                            </div>
                                        </div>
                                        <div className="ml-8">
                                            <p>{customer.address}</p>
                                            <p>{customer.city}, {customer.state} {customer.postal_code}</p>
                                            <p>{customer.country}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700">No address found</h3>
                                    <p className="text-gray-500 mt-1">This customer hasn&apos;t added any addresses yet</p>
                                    <button 
                                        className="mt-4 px-4 py-2 bg-amber-100 rounded-md text-amber-600 hover:bg-amber-200"
                                        onClick={() => showAlert('info', 'Add address functionality would be implemented here', 2000)}
                                    >
                                        Add New Address
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                    
                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3 className="text-lg font-medium mb-4">Customer Notes</h3>
                            
                            <div className="mb-6">
                                <div className="flex">
                                    <textarea
                                        className="flex-grow border rounded-l-md p-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        placeholder="Add a note about this customer..."
                                        rows={3}
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    ></textarea>
                                    <button
                                        className="bg-amber-500 text-white px-4 rounded-r-md flex items-center"
                                        onClick={handleAddNote}
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="text-center py-12">
                                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-700">No notes yet</h3>
                                <p className="text-gray-500 mt-1">Add your first note about this customer</p>
                                </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
} 