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
    Tag, 
    Edit, 
    Trash2, 
    Clock, 
    CheckCircle, 
    XCircle,
    User,
    Home,
    FileText,
    MessageSquare,
    Send
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

// Mock customer data - in a real app, you would fetch this from an API
const getCustomerData = (id: number) => {
    return {
        id,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, USA',
        joinDate: '2023-08-15',
        status: 'Active',
        orders: 12,
        totalSpent: '1,549.99',
        lastOrder: '2023-11-20',
        tags: ['Loyal', 'Premium'],
        addresses: [
            {
                id: 1,
                type: 'Billing',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'USA',
                isDefault: true
            },
            {
                id: 2,
                type: 'Shipping',
                street: '456 Park Avenue',
                city: 'New York',
                state: 'NY',
                zipCode: '10002',
                country: 'USA',
                isDefault: true
            }
        ],
        paymentMethods: [
            {
                id: 1,
                type: 'Credit Card',
                last4: '4242',
                brand: 'Visa',
                expiryDate: '12/25',
                isDefault: true
            },
            {
                id: 2,
                type: 'Credit Card',
                last4: '1234',
                brand: 'Mastercard',
                expiryDate: '09/24',
                isDefault: false
            }
        ],
        orderHistory: [
            {
                id: 'ORD-001',
                date: '2023-11-20',
                total: '249.99',
                status: 'Delivered',
                items: 3
            },
            {
                id: 'ORD-002',
                date: '2023-10-15',
                total: '189.50',
                status: 'Delivered',
                items: 2
            },
            {
                id: 'ORD-003',
                date: '2023-09-28',
                total: '349.99',
                status: 'Delivered',
                items: 4
            },
            {
                id: 'ORD-004',
                date: '2023-08-17',
                total: '99.95',
                status: 'Delivered',
                items: 1
            },
            {
                id: 'ORD-005',
                date: '2023-07-30',
                total: '159.99',
                status: 'Delivered',
                items: 2
            }
        ],
        notes: [
            {
                id: 1,
                date: '2023-11-22',
                author: 'Admin',
                content: 'Customer requested information about upcoming sales.'
            },
            {
                id: 2,
                date: '2023-10-15',
                author: 'Support',
                content: 'Resolved issue with last order delivery.'
            }
        ]
    };
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
const OrderItem = ({ order }: { order: any }) => {
    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="py-4 px-3">
                <div className="flex items-center">
                    <Link href={`/admin/orders/${order.id}`}>
                        <span className="font-medium text-amber-600">{order.id}</span>
                    </Link>
                </div>
            </td>
            <td className="py-4 px-3 text-sm text-gray-500">
                {order.date}
            </td>
            <td className="py-4 px-3 text-sm">
                {order.items} {order.items === 1 ? 'item' : 'items'}
            </td>
            <td className="py-4 px-3 text-sm font-medium">
                ${order.total}
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
                <Link href={`/admin/orders/${order.id}`}>
                    <button className="text-sm text-amber-600 hover:text-amber-500">
                        View Details
                    </button>
                </Link>
            </td>
        </tr>
    );
};

// Address card component
const AddressCard = ({ address }: { address: any }) => {
    return (
        <motion.div 
            variants={itemVariants}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                    <Home className="h-4 w-4 text-gray-400 mr-2" />
                    <h3 className="font-medium">{address.type} Address</h3>
                </div>
                {address.isDefault && (
                    <span className="bg-amber-100 text-amber-600 text-xs px-2 py-1 rounded-full">
                        Default
                    </span>
                )}
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
            </div>
            
            <div className="mt-3 flex justify-end space-x-2">
                <button className="text-gray-500 hover:text-amber-500">
                    <Edit className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    );
};

// Payment method card component
const PaymentMethodCard = ({ paymentMethod }: { paymentMethod: any }) => {
    return (
        <motion.div 
            variants={itemVariants}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                    <h3 className="font-medium">{paymentMethod.brand}</h3>
                </div>
                {paymentMethod.isDefault && (
                    <span className="bg-amber-100 text-amber-600 text-xs px-2 py-1 rounded-full">
                        Default
                    </span>
                )}
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
                <p>•••• •••• •••• {paymentMethod.last4}</p>
                <p>Expires {paymentMethod.expiryDate}</p>
            </div>
            
            <div className="mt-3 flex justify-end space-x-2">
                <button className="text-gray-500 hover:text-amber-500">
                    <Edit className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    );
};

// Note item component
const NoteItem = ({ note }: { note: any }) => {
    return (
        <motion.div 
            variants={itemVariants}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-start">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                    <div>
                        <div className="flex items-center">
                            <span className="font-medium">{note.author}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm text-gray-500">{note.date}</span>
                        </div>
                        <p className="text-sm mt-1">{note.content}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { showAlert } = useAlert();
    const [activeTab, setActiveTab] = useState('overview');
    const [newNote, setNewNote] = useState('');
    
    // Get customer ID from URL params
    const customerId = typeof params.id === 'string' ? parseInt(params.id, 10) : 0;
    
    // Get customer data
    const customer = getCustomerData(customerId);
    
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
                                {customer.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            {customer.name}
                        </h1>
                        <p className="text-gray-500 text-sm">Customer ID: {customer.id}</p>
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
                                customer.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <span className="font-medium">{customer.status}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 mb-1">Member Since</span>
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">{customer.joinDate}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 mb-1">Total Orders</span>
                        <div className="flex items-center">
                            <ShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">{customer.orders}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 mb-1">Total Spent</span>
                        <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">${customer.totalSpent}</span>
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
                                <a href={`tel:${customer.phone}`} className="text-amber-600 hover:underline">
                                    {customer.phone}
                                </a>
                            </div>
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 mb-1">Location</span>
                            <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{customer.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-2">
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
                            label="Addresses" 
                            active={activeTab === 'addresses'} 
                            onClick={() => setActiveTab('addresses')} 
                        />
                        <Tab 
                            label="Payment Methods" 
                            active={activeTab === 'payment'} 
                            onClick={() => setActiveTab('payment')} 
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
                                <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium mb-3 flex items-center">
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        Recent Orders
                                    </h3>
                                    
                                    {customer.orderHistory.slice(0, 3).map((order: any) => (
                                        <div key={order.id} className="mb-3 last:mb-0">
                                            <div className="flex justify-between items-center">
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <span className="text-sm font-medium text-amber-600">{order.id}</span>
                                                </Link>
                                                <span className="text-xs text-gray-500">{order.date}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ${order.total} • {order.status}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        className="text-sm text-amber-600 mt-2 hover:underline"
                                        onClick={() => setActiveTab('orders')}
                                    >
                                        View all orders
                                    </button>
                                </motion.div>
                                
                                <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium mb-3 flex items-center">
                                        <Home className="h-4 w-4 mr-2" />
                                        Default Addresses
                                    </h3>
                                    
                                    {customer.addresses
                                        .filter((address: any) => address.isDefault)
                                        .map((address: any) => (
                                            <div key={address.id} className="mb-3 last:mb-0">
                                                <div className="text-sm font-medium">{address.type}</div>
                                                <div className="text-xs text-gray-500">
                                                    {address.street}, {address.city}, {address.state} {address.zipCode}
                                                </div>
                                            </div>
                                        ))
                                    }
                                    
                                    <button 
                                        className="text-sm text-amber-600 mt-2 hover:underline"
                                        onClick={() => setActiveTab('addresses')}
                                    >
                                        Manage addresses
                                    </button>
                                </motion.div>
                                
                                <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium mb-3 flex items-center">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Recent Notes
                                    </h3>
                                    
                                    {customer.notes.slice(0, 2).map((note: any) => (
                                        <div key={note.id} className="mb-3 last:mb-0">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">{note.author}</span>
                                                <span className="text-xs text-gray-500">{note.date}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {note.content}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        className="text-sm text-amber-600 mt-2 hover:underline"
                                        onClick={() => setActiveTab('notes')}
                                    >
                                        View all notes
                                    </button>
                                </motion.div>
                                
                                <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium mb-3 flex items-center">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Payment Methods
                                    </h3>
                                    
                                    {customer.paymentMethods
                                        .filter((payment: any) => payment.isDefault)
                                        .map((payment: any) => (
                                            <div key={payment.id} className="mb-3 last:mb-0">
                                                <div className="text-sm font-medium">{payment.brand}</div>
                                                <div className="text-xs text-gray-500">
                                                    •••• {payment.last4} • Expires {payment.expiryDate}
                                                </div>
                                            </div>
                                        ))
                                    }
                                    
                                    <button 
                                        className="text-sm text-amber-600 mt-2 hover:underline"
                                        onClick={() => setActiveTab('payment')}
                                    >
                                        Manage payment methods
                                    </button>
                                </motion.div>
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
                            <h3 className="font-medium mb-4">Order History</h3>
                            
                            {customer.orderHistory.length > 0 ? (
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
                                            {customer.orderHistory.map((order: any) => (
                                                <OrderItem key={order.id} order={order} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No orders found for this customer
                                </div>
                            )}
                        </motion.div>
                    )}
                    
                    {/* Addresses Tab */}
                    {activeTab === 'addresses' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium">Saved Addresses</h3>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-amber-100 text-amber-600 px-3 py-1 rounded-md text-sm flex items-center"
                                >
                                    Add Address
                                </motion.button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {customer.addresses.map((address: any) => (
                                    <AddressCard key={address.id} address={address} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Payment Methods Tab */}
                    {activeTab === 'payment' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium">Payment Methods</h3>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-amber-100 text-amber-600 px-3 py-1 rounded-md text-sm flex items-center"
                                >
                                    Add Payment Method
                                </motion.button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {customer.paymentMethods.map((paymentMethod: any) => (
                                    <PaymentMethodCard key={paymentMethod.id} paymentMethod={paymentMethod} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3 className="font-medium mb-4">Customer Notes</h3>
                            
                            <div className="mb-6">
                                <div className="flex">
                                    <textarea
                                        className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        placeholder="Add a note about this customer..."
                                        rows={2}
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    ></textarea>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-amber-500 text-white px-4 rounded-r-md flex items-center"
                                        onClick={handleAddNote}
                                    >
                                        <Send className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>
                            
                            {customer.notes.length > 0 ? (
                                <div className="space-y-4">
                                    {customer.notes.map((note: any) => (
                                        <NoteItem key={note.id} note={note} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No notes found for this customer
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
} 