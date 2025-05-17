'use client';

// import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    CheckCircle, 
    Truck, 
    ShoppingBag, 
    ArrowRight,
    Clock,
    Calendar,
    MapPin
} from 'lucide-react';
import Link from 'next/link';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function OrderConfirmationPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    
    const orderData = {
        id: orderId || '12345678',
        date: new Date().toLocaleDateString(),
        total: 1664.97,
        items: 2,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        shippingAddress: '123 Main St, Anytown, Province, 12345',
        paymentMethod: 'Credit Card (**** 1234)'
    };
    
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <motion.div 
                className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <div className="bg-green-50 p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Thank You for Your Order!</h1>
                    <p className="text-gray-600 mt-2">
                        Your order has been confirmed and will be shipping soon.
                    </p>
                </div>
                
                {/* Order Info */}
                <div className="p-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                        <motion.div variants={itemVariants} className="mb-4 md:mb-0">
                            <h2 className="text-sm text-gray-500">Order Number</h2>
                            <p className="text-lg font-semibold">#{orderData.id}</p>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                            <h2 className="text-sm text-gray-500">Order Date</h2>
                            <p className="text-lg font-semibold">{orderData.date}</p>
                        </motion.div>
                    </div>
                    
                    {/* Order Summary Card */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-gray-50 rounded-lg p-6 mb-8"
                    >
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <ShoppingBag className="h-5 w-5 mr-2 text-amber-500" />
                            Order Summary
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount</span>
                                <span className="font-semibold">${orderData.total.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Items</span>
                                <span>{orderData.items}</span>
                            </div>
                            
                            <div className="flex justify-between border-t pt-4">
                                <span className="text-gray-600">Payment Method</span>
                                <span>{orderData.paymentMethod}</span>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Shipping Info */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h2 className="text-lg font-semibold mb-3 flex items-center">
                                <Truck className="h-5 w-5 mr-2 text-amber-500" />
                                Shipping Info
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <Clock className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-500">Estimated Delivery Date</p>
                                        <p className="font-medium">{orderData.estimatedDelivery}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-500">Shipping Address</p>
                                        <p className="font-medium">{orderData.shippingAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-semibold mb-3 flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-amber-500" />
                                Next Steps
                            </h2>
                            <p className="text-gray-600 text-sm">
                                We&apos;ll send you shipping confirmation when your item(s) are on the way! You can check the status of your order at any time by visiting your account.
                            </p>
                        </div>
                    </motion.div>
                    
                    {/* CTA Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        <Link href="/account/orders" className="flex-1">
                            <button className="w-full py-3 border border-amber-500 text-amber-500 rounded-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50">
                                View Order Status
                            </button>
                        </Link>
                        
                        <Link href="/" className="flex-1">
                            <button className="w-full py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 flex items-center justify-center">
                                Continue Shopping
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
} 