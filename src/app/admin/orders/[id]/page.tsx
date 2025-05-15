'use client';

import { useState, useEffect } from 'react';
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
    ChevronUp,
    Loader2,
    X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAlert } from '@/lib/context/alert-context';
import { getOrderById, updateOrderStatus } from '@/lib/supabase';

// Define interfaces for order data
interface OrderItem {
    id: number;
    name: string;
    sku: string;
    price: string;
    quantity: number;
    total: string;
    image: string;
}

interface OrderEvent {
    date: string;
    time: string;
    status: string;
    description: string;
}

interface CustomerAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: CustomerAddress;
}

interface PaymentDetails {
    cardType?: string;
    cardNumber?: string;
    transactionId?: string;
}

interface OrderData {
    id: number;
    orderNumber: string;
    customer: CustomerInfo;
    date: string;
    time: string;
    status: string;
    paymentMethod: string;
    paymentDetails: PaymentDetails;
    shippingMethod: string;
    trackingNumber: string;
    items: OrderItem[];
    subtotal: string;
    shipping: string;
    tax: string;
    discount: string;
    total: string;
    notes: string;
    history: OrderEvent[];
}

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
    const params = useParams();
    const orderId = typeof params.id === 'string' ? parseInt(params.id, 10) : 0;
    const router = useRouter();
    const { showAlert } = useAlert();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isNoteExpanded, setIsNoteExpanded] = useState(false);
    const [orderNote, setOrderNote] = useState('');

    // State for order data
    const [orderData, setOrderData] = useState<OrderData | null>(null);

    // Fetch order data from Supabase
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await getOrderById(orderId);
                
                if (error) {
                    throw new Error(error.message);
                }
                
                if (data) {
                    // Format the order data for display
                    const orderDate = new Date(data.order.order_date);
                    const formattedDate = orderDate.toISOString().split('T')[0];
                    const formattedTime = orderDate.toTimeString().split(' ')[0].substring(0, 5);
                    
                    // Transform order items
                    const items = data.orderItems ? data.orderItems.map((item: { order_item_id: number; product_id: number; products?: { name: string; image: string }; unit_price: number; quantity: number; subtotal: number; }) => ({
                        id: item.order_item_id,
                        name: item.products?.name || `Product #${item.product_id}`,
                        sku: `SKU-${item.product_id}`,
                        price: `$${item.unit_price.toFixed(2)}`,
                        quantity: item.quantity,
                        total: `$${item.subtotal.toFixed(2)}`,
                        image: item.products?.image || '/placeholder.jpg'
                    })) : [];
                    
                    // Create formatted order object
                    const formattedOrder: OrderData = {
                        id: data.order.order_id,
                        orderNumber: data.order.order_number,
                        customer: {
                            name: data.user?.username || `User #${data.order.user_id}`,
                            email: data.user?.email || 'customer@example.com',
                            phone: '+1 (555) 123-4567', // Placeholder
                            address: {
                                street: '123 Main Street', // Placeholder
                                city: 'New York',
                                state: 'NY',
                                zipCode: '10001',
                                country: 'United States'
                            }
                        },
                        date: formattedDate,
                        time: formattedTime,
                        status: data.order.status.charAt(0).toUpperCase() + data.order.status.slice(1),
                        paymentMethod: data.payment?.payment_method || 'Credit Card',
                        paymentDetails: {
                            cardType: 'Visa', // Placeholder
                            cardNumber: '**** **** **** 4242', // Placeholder
                            transactionId: data.payment?.transaction_id || 'TXN-123456789'
                        },
                        shippingMethod: data.shipping?.shipping_method || 'Standard Shipping',
                        trackingNumber: data.shipping?.tracking_number || 'N/A',
                        items: items,
                        subtotal: `$${data.order.total_amount.toFixed(2)}`,
                        shipping: data.shipping ? `$${data.shipping.shipping_cost.toFixed(2)}` : '$0.00',
                        tax: '$0.00', // Placeholder
                        discount: '$0.00', // Placeholder
                        total: `$${data.order.total_amount.toFixed(2)}`,
                        notes: '',
                        history: [
                            { 
                                date: formattedDate, 
                                time: formattedTime, 
                                status: 'Order Placed', 
                                description: 'Order was placed by customer' 
                            }
                        ]
                    };
                    
                    setOrderData(formattedOrder);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load order');
                showAlert('error', 'Failed to load order details', 5000);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchOrder();
    }, [orderId, showAlert]);

    const handleStatusChange = async (newStatus: string) => {
        try {
            setIsStatusDropdownOpen(false);
            
            // Update status in Supabase
            const { error } = await updateOrderStatus(orderId, newStatus.toLowerCase());
            
            if (error) {
                throw new Error(error.message);
            }
            
            // Update local state
            if (orderData) {
                const now = new Date();
                const date = now.toISOString().split('T')[0];
                const time = now.toTimeString().split(' ')[0].substring(0, 5);
                
                // Add to history
                const updatedHistory = [
                    ...orderData.history,
                    {
                        date,
                        time,
                        status: newStatus,
                        description: `Order status changed to ${newStatus}`
                    }
                ];
                
                setOrderData({
                    ...orderData,
                    status: newStatus,
                    history: updatedHistory
                });
                
                showAlert('success', `Order status updated to ${newStatus}`, 2000);
            }
        } catch (err) {
            showAlert('error', err instanceof Error ? err.message : 'Failed to update order status', 5000);
        }
    };

    const handleSendInvoice = () => {
        showAlert('success', 'Invoice sent to customer email', 2000);
    };

    const handlePrintInvoice = () => {
        showAlert('info', 'Preparing invoice for printing...', 2000);
        // In a real app, this would trigger the print dialog
        window.print();
    };

    const handleAddNote = () => {
        if (orderNote.trim() && orderData) {
            // In a real app, you would save this note to the database
            setOrderData({
                ...orderData,
                notes: orderNote
            });
            
            showAlert('success', 'Note added to order', 2000);
            setOrderNote('');
            setIsNoteExpanded(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <Link href="/admin/orders" className="text-gray-500 hover:text-amber-500 flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Link>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-xl font-medium text-gray-900 mb-2">Order not found</h2>
                    <p className="text-gray-500 mb-6">The order you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <button 
                        onClick={() => router.push('/admin/orders')}
                        className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    >
                        Return to Orders
                    </button>
                </div>
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
                    <h1 className="text-2xl font-bold">Order #{orderData.orderNumber}</h1>
                    <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">{orderData.date} at {orderData.time}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row mt-4 md:mt-0 space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className="relative">
                        <button
                            className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        >
                            <span className="mr-2">Status:</span>
                            <StatusBadge status={orderData.status} />
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
                                            className={`block w-full text-left px-4 py-2 text-sm ${orderData.status === status ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                } hover:bg-gray-100`}
                                            onClick={() => handleStatusChange(status)}
                                        >
                                            <div className="flex items-center">
                                                <StatusBadge status={status} />
                                                {orderData.status === status && (
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
                {/* Order Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-medium mb-4">Order Items</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {orderData.items.map((item: OrderItem) => (
                                            <tr key={item.id}>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="object-cover"
                                                                fill
                                                                sizes="40px"
                                                                onError={(e) => {
                                                                    // TypeScript doesn't allow direct src assignment on Image component
                                                                    // We can use a placeholder image URL instead
                                                                    const imgElement = e.target as HTMLImageElement;
                                                                    if (imgElement.src !== 'https://placekitten.com/100/100') {
                                                                        imgElement.src = 'https://placekitten.com/100/100';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-500">{item.sku}</td>
                                                <td className="py-4 px-4 text-sm text-gray-500">{item.price}</td>
                                                <td className="py-4 px-4 text-sm text-gray-500">{item.quantity}</td>
                                                <td className="py-4 px-4 text-sm text-gray-900 text-right">{item.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan={4} className="py-3 px-4 text-right text-sm font-medium text-gray-500">Subtotal</td>
                                            <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">{orderData.subtotal}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={4} className="py-3 px-4 text-right text-sm font-medium text-gray-500">Shipping</td>
                                            <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">{orderData.shipping}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={4} className="py-3 px-4 text-right text-sm font-medium text-gray-500">Tax</td>
                                            <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">{orderData.tax}</td>
                                        </tr>
                                        {parseFloat(orderData.discount.replace('$', '')) > 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-3 px-4 text-right text-sm font-medium text-gray-500">Discount</td>
                                                <td className="py-3 px-4 text-right text-sm font-medium text-red-600">-{orderData.discount}</td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td colSpan={4} className="py-3 px-4 text-right text-sm font-medium text-gray-900">Total</td>
                                            <td className="py-3 px-4 text-right text-lg font-bold text-gray-900">{orderData.total}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md mt-6 p-6">
                        <h2 className="text-lg font-medium mb-4">Order Timeline</h2>
                        <div className="space-y-6">
                            {orderData.history.map((event: OrderEvent, index: number) => (
                                <div key={index} className="flex">
                                    <div className="flex flex-col items-center mr-4">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                            {event.status === 'Order Placed' && <Package className="h-5 w-5 text-amber-500" />}
                                            {event.status === 'Payment Confirmed' && <CreditCard className="h-5 w-5 text-amber-500" />}
                                            {event.status === 'Processing' && <Package className="h-5 w-5 text-amber-500" />}
                                            {event.status === 'Shipped' && <Truck className="h-5 w-5 text-amber-500" />}
                                            {event.status === 'Completed' && <Check className="h-5 w-5 text-amber-500" />}
                                            {event.status === 'Cancelled' && <X className="h-5 w-5 text-amber-500" />}
                                        </div>
                                        {index < orderData.history.length - 1 && (
                                            <div className="w-0.5 bg-gray-200 h-full mt-2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-md font-medium text-gray-900">{event.status}</h3>
                                        <p className="text-sm text-gray-500">{event.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">{event.date} at {event.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Customer Info Sidebar */}
                <div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-medium mb-4">Customer Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">{orderData.customer.name}</h3>
                                    <p className="text-sm text-gray-500">{orderData.customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Phone</h3>
                                    <p className="text-sm text-gray-500">{orderData.customer.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Shipping Address</h3>
                                    <p className="text-sm text-gray-500">
                                        {orderData.customer.address.street}<br />
                                        {orderData.customer.address.city}, {orderData.customer.address.state} {orderData.customer.address.zipCode}<br />
                                        {orderData.customer.address.country}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                        <h2 className="text-lg font-medium mb-4">Payment & Shipping</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Payment Method</h3>
                                    <p className="text-sm text-gray-500">{orderData.paymentMethod}</p>
                                    {orderData.paymentDetails.cardNumber && (
                                        <p className="text-sm text-gray-500">{orderData.paymentDetails.cardNumber}</p>
                                    )}
                                    {orderData.paymentDetails.transactionId && (
                                        <p className="text-xs text-gray-400 mt-1">Transaction ID: {orderData.paymentDetails.transactionId}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Truck className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Shipping Method</h3>
                                    <p className="text-sm text-gray-500">{orderData.shippingMethod}</p>
                                    {orderData.trackingNumber && orderData.trackingNumber !== 'N/A' && (
                                        <p className="text-xs text-gray-400 mt-1">Tracking: {orderData.trackingNumber}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium">Notes</h2>
                            <button
                                className="text-amber-500 hover:text-amber-600 text-sm font-medium"
                                onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                            >
                                {isNoteExpanded ? 'Cancel' : 'Add Note'}
                            </button>
                        </div>

                        {isNoteExpanded ? (
                            <div>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    rows={4}
                                    placeholder="Add a note about this order..."
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                ></textarea>
                                <button
                                    className="mt-2 bg-amber-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-600"
                                    onClick={handleAddNote}
                                >
                                    Save Note
                                </button>
                            </div>
                        ) : (
                            <div>
                                {orderData.notes ? (
                                    <p className="text-sm text-gray-500">{orderData.notes}</p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No notes for this order</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 