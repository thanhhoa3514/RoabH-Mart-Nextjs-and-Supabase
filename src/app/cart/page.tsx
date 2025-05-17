'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Minus, 
    Plus, 
    Trash2, 
    ShoppingBag, 
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

export default function CartPage() {
    const router = useRouter();
    
    // Mock cart data - would normally be fetched from the server or state management
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Smartphone XS Max',
            price: 1299.99,
            quantity: 1,
            image: 'https://placekitten.com/200/200'
        },
        {
            id: 2,
            name: 'Wireless Headphones',
            price: 199.99,
            quantity: 1,
            image: 'https://placekitten.com/201/201'
        }
    ]);
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal >= 100 ? 0 : 15; // Free shipping over $100
    const total = subtotal + tax + shipping;
    
    // Handle quantity changes
    const updateQuantity = (id: number, change: number) => {
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.id === id 
                    ? { ...item, quantity: Math.max(1, item.quantity + change) } 
                    : item
            )
        );
    };
    
    // Remove item from cart
    const removeItem = (id: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };
    
    // Handle checkout
    const handleCheckout = () => {
        router.push('/checkout');
    };
    
    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-16">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8">
                            Looks like you haven&apos;t added any products to your cart yet.
                        </p>
                        <Link href="/">
                            <button className="px-6 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 inline-flex items-center">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Continue Shopping
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-gray-600 hover:text-amber-500">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Continue Shopping
                    </Link>
                    
                    <h1 className="text-2xl font-bold mt-4 flex items-center">
                        <ShoppingBag className="h-6 w-6 mr-2 text-amber-500" />
                        Your Shopping Cart
                    </h1>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <motion.div
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="p-6">
                                <div className="flow-root">
                                    <ul className="-my-6 divide-y divide-gray-200">
                                        {cartItems.map(item => (
                                            <motion.li key={item.id} className="py-6 flex" variants={itemVariants}>
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="object-cover object-center"
                                                        fill
                                                    />
                                                </div>
                                                
                                                <div className="ml-4 flex-1 flex flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                                            <h3>{item.name}</h3>
                                                            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                                                    </div>
                                                    
                                                    <div className="flex-1 flex items-end justify-between">
                                                        <div className="flex items-center">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                                className="p-1 rounded-md hover:bg-gray-100"
                                                            >
                                                                <Minus className="h-4 w-4 text-gray-400" />
                                                            </button>
                                                            
                                                            <span className="mx-2 text-gray-700">{item.quantity}</span>
                                                            
                                                            <button
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                className="p-1 rounded-md hover:bg-gray-100"
                                                            >
                                                                <Plus className="h-4 w-4 text-gray-400" />
                                                            </button>
                                                        </div>
                                                        
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    
                    {/* Order Summary */}
                    <div>
                        <motion.div
                            className="bg-white rounded-lg shadow-md p-6 sticky top-6"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h2 className="text-lg font-medium mb-6">Order Summary</h2>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (10%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                
                                <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            {shipping === 0 && (
                                <div className="mt-4 bg-green-50 p-3 rounded-md text-sm text-green-700">
                                    You qualified for free shipping!
                                </div>
                            )}
                            
                            <div className="mt-6">
                                <motion.button
                                    onClick={handleCheckout}
                                    className="w-full py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 flex items-center justify-center"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
} 