'use client';

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
import { useCart } from '@/providers/cart-provider';

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

    const { items: cartItems, totalPrice: subtotal, isLoading, updateQuantity: updateQty, removeFromCart: removeItem } = useCart();

    // Calculate totals based on real data
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 15; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Handle quantity changes using provider method
    const handleUpdateQuantity = async (cartItemId: number, currentQuantity: number, change: number) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 1) return;
        try {
            await updateQty(cartItemId, newQuantity);
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    // Handle removal using provider method
    const handleRemoveItem = async (cartItemId: number) => {
        try {
            await removeItem(cartItemId);
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    // Handle checkout
    const handleCheckout = () => {
        router.push('/checkout');
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen py-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your cart...</p>
                </div>
            </div>
        );
    }

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
                                        {cartItems.map((item) => (
                                            <motion.li key={item.cart_item_id} className="py-6 flex" variants={itemVariants}>
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="object-cover object-center"
                                                            fill
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                            <ShoppingBag className="h-8 w-8 text-gray-300" />
                                                        </div>
                                                    )}
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
                                                                onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity, -1)}
                                                                className="p-1 rounded-md hover:bg-gray-100"
                                                            >
                                                                <Minus className="h-4 w-4 text-gray-400" />
                                                            </button>

                                                            <span className="mx-2 text-gray-700">{item.quantity}</span>

                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity, 1)}
                                                                className="p-1 rounded-md hover:bg-gray-100"
                                                            >
                                                                <Plus className="h-4 w-4 text-gray-400" />
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => handleRemoveItem(item.cart_item_id)}
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