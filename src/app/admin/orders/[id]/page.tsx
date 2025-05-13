'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Printer,
    Mail,
    User,
    MapPin,
    Phone,
    Calendar,
    CreditCard,
    Package,
    Truck,
    Check,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAlert } from '@/lib/context/alert-context';

// Status badge component
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

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showAlert } = useAlert();
    const [isLoading, setIsLoading] = useState(true);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isNoteExpanded, setIsNoteExpanded] = useState(false);
    const [orderNote, setOrderNote] = useState('');

    // Mock order data - in a real app, this would come from an API
    const [order, setOrder] = useState({
        id: id as string,
        orderNumber: 'ORD-2023-1001',
        customer: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            address: {
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'United States'
            }
        },
        date: '2023-11-28',
        time: '14:35',
        status: 'Processing',
        paymentMethod: 'Credit Card',
        paymentDetails: {
            cardType: 'Visa',
            cardNumber: '**** **** **** 4242',
            transactionId: 'TXN-123456789'
        },
        shippingMethod: 'Express Delivery',
        trackingNumber: 'TRK-987654321',
        items: [
            {
                id: 1,
                name: 'Premium Laptop Pro',
                sku: 'ELEC-LP-1001',
                price: '$1,199.00',
                quantity: 1,
                total: '$1,199.00',
                image: '/laptop.jpg'
            },
            {
                id: 2,
                name: 'Wireless Headphones',
                sku: 'ELEC-WH-2002',
                price: '$79.99',
                quantity: 1,
                total: '$79.99',
                image: '/headphones.jpg'
            },
            {
                id: 3,
                name: 'USB-C Charging Cable',
                sku: 'ELEC-CC-3003',
                price: '$19.99',
                quantity: 1,
                total: '$19.99',
                image: '/cable.jpg'
            }
        ],
        subtotal: '$1,298.98',
        shipping: '$0.00',
        tax: '$129.90',
        discount: '$129.88',
        total: '$1,299.00',
        notes: 'Customer requested gift wrapping for the headphones. Please include a gift message.',
        history: [
            { date: '2023-11-28', time: '14:35', status: 'Order Placed', description: 'Order was placed by customer' },
            { date: '2023-11-28', time: '14:40', status: 'Payment Confirmed', description: 'Payment was successfully processed' },
            { date: '2023-11-28', time: '15:20', status: 'Processing', description: 'Order is being prepared for shipping' }
        ]
    });

    useEffect(() => {
        // Simulate API call
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    const handleStatusChange = (newStatus: string) => {
        setOrder(prev => ({ ...prev, status: newStatus }));
        setIsStatusDropdownOpen(false);
        showAlert('success', `Order status updated to ${newStatus}`, 2000);

        // In a real app, you would make an API call to update the status
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].substring(0, 5);

        // Add to history
        const updatedHistory = [
            ...order.history,
            {
                date,
                time,
                status: newStatus,
                description: `Order status changed to ${newStatus}`
            }
        ];

        setOrder(prev => ({ ...prev, history: updatedHistory }));
    };

    const handleSendInvoice = () => {
        showAlert('success', 'Invoice sent to customer email', 2000);
    };

    const handlePrintInvoice = () => {
        showAlert('info', 'Preparing invoice for printing...', 2000);
        // In a real app, this would trigger the print dialog
    };

    const handleAddNote = () => {
        if (orderNote.trim()) {
            showAlert('success', 'Note added to order', 2000);
            setOrderNote('');
            setIsNoteExpanded(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/admin/orders" className="text-gray-500 hover:text-amber-500 flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                    <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">{order.date} at {order.time}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row mt-4 md:mt-0 space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className="relative">
                        <button
                            className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        >
                            <span className="mr-2">Status:</span>
                            <StatusBadge status={order.status} />
                            {isStatusDropdownOpen ? (
                                <ChevronUp className="ml-2 h-4 w-4" />
                            ) : (
                                <ChevronDown className="ml-2 h-4 w-4" />
                            )}
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                    {['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            className={`block w-full text-left px-4 py-2 text-sm ${order.status === status ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                } hover:bg-gray-100`}
                                            onClick={() => handleStatusChange(status)}
                                        >
                                            <div className="flex items-center">
                                                <StatusBadge status={status} />
                                                {order.status === status && (
                                                    <Check className="ml-auto h-4 w-4 text-green-500" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className="flex items-center bg-gray-100 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
                        onClick={handleSendInvoice}
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Invoice
                    </button>

                    <button
                        className="flex items-center bg-gray-100 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
                        onClick={handlePrintInvoice}
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4">Customer Information</h2>

                    <div className="space-y-4">
                        <div className="flex">
                            <User className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                                <p className="font-medium">{order.customer.name}</p>
                                <p className="text-sm text-gray-500">{order.customer.email}</p>
                            </div>
                        </div>

                        <div className="flex">
                            <Phone className="h-5 w-5 text-gray-400 mr-3" />
                            <p>{order.customer.phone}</p>
                        </div>

                        <div className="flex">
                            <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                            <div>
                                <p>{order.customer.address.street}</p>
                                <p>{order.customer.address.city}, {order.customer.address.state} {order.customer.address.zipCode}</p>
                                <p>{order.customer.address.country}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                        <h3 className="text-sm font-medium mb-2">Shipping Method</h3>
                        <div className="flex items-center">
                            <Truck className="h-5 w-5 text-gray-400 mr-2" />
                            <span>{order.shippingMethod}</span>
                        </div>
                        {order.trackingNumber && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">Tracking Number:</p>
                                <p className="font-medium">{order.trackingNumber}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t">
                        <h3 className="text-sm font-medium mb-2">Payment Information</h3>
                        <div className="flex items-center">
                            <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                            <span>{order.paymentMethod}</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">{order.paymentDetails.cardType}</p>
                            <p className="font-medium">{order.paymentDetails.cardNumber}</p>
                            <p className="text-sm text-gray-500 mt-1">Transaction ID: {order.paymentDetails.transactionId}</p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Order Items</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">{item.sku}</td>
                                        <td className="py-4 px-4">{item.price}</td>
                                        <td className="py-4 px-4">{item.quantity}</td>
                                        <td className="py-4 px-4 font-medium">{item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Shipping</span>
                            <span>{order.shipping}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Tax</span>
                            <span>{order.tax}</span>
                        </div>
                        {parseFloat(order.discount.replace('$', '')) > 0 && (
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Discount</span>
                                <span className="text-green-600">-{order.discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-3 border-t mt-2">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-lg">{order.total}</span>
                        </div>
                    </div>
                </div>

                {/* Order Notes and History */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Order Notes</h2>
                                <button
                                    className="text-amber-500 text-sm hover:text-amber-600"
                                    onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                                >
                                    {isNoteExpanded ? 'Cancel' : 'Add Note'}
                                </button>
                            </div>

                            {isNoteExpanded ? (
                                <div className="space-y-3">
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        rows={3}
                                        placeholder="Add a note to this order..."
                                        value={orderNote}
                                        onChange={(e) => setOrderNote(e.target.value)}
                                    ></textarea>
                                    <button
                                        className="bg-amber-500 text-white px-4 py-2 rounded-md text-sm hover:bg-amber-600"
                                        onClick={handleAddNote}
                                    >
                                        Add Note
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-md">
                                    {order.notes ? (
                                        <p className="text-sm">{order.notes}</p>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No notes for this order</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold mb-4">Order History</h2>
                            <div className="space-y-4">
                                {order.history.map((event, index) => (
                                    <div key={index} className="relative pl-6 pb-4">
                                        {index < order.history.length - 1 && (
                                            <div className="absolute left-2 top-2 h-full w-0.5 bg-gray-200"></div>
                                        )}
                                        <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-amber-500"></div>
                                        <div>
                                            <p className="font-medium">{event.status}</p>
                                            <p className="text-sm text-gray-500">{event.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">{event.date} at {event.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 