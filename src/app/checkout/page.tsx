'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    MapPin,
    ShoppingBag,
    Truck,
    Loader2,
    CreditCard
} from 'lucide-react';
import { useAlert } from '@/providers/alert-provider';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/hooks/use-cart';
import Link from 'next/link';

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

export default function CheckoutPage() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const { userData } = useAuth();
    const { items: cartItems, subtotal } = useCart();

    // Calculate totals
    const shippingCost = subtotal > 100 ? 0 : 15.00; // Free shipping over $100
    const taxRate = 0.10; // 10% tax
    const taxAmount = subtotal * taxRate;
    const total = subtotal + shippingCost + taxAmount;

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: userData?.email || '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear errors when field is edited
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/^\\S+@\\S+\\.\\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.province.trim()) newErrors.province = 'Province is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProceedToPayment = async () => {
        if (!validateForm()) {
            showAlert('error', 'Please fill in all required fields', 3000);
            return;
        }

        if (cartItems.length === 0) {
            showAlert('error', 'Your cart is empty', 3000);
            return;
        }

        if (!userData?.user_id) {
            showAlert('error', 'Please log in to continue', 3000);
            router.push('/auth/login');
            return;
        }

        setIsProcessing(true);

        try {
            // Prepare checkout data
            const checkoutData = {
                cartItems: cartItems.map(item => ({
                    product_id: item.product_id.toString(),
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    image: item.image || undefined,
                })),
                shippingInfo: formData,
                totals: {
                    subtotal,
                    shipping: shippingCost,
                    tax: taxAmount,
                    total,
                },
                userId: userData.user_id,
            };

            // Call checkout API to create order and Stripe session
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(checkoutData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            if (data.sessionUrl) {
                window.location.href = data.sessionUrl;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            showAlert('error', 'Failed to process checkout. Please try again.', 5000);
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-4">Add some items to your cart to checkout</p>
                    <Link
                        href="/products"
                        className="inline-block px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href="/cart" className="flex items-center text-gray-600 hover:text-amber-500">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Cart
                    </Link>

                    <h1 className="text-2xl font-bold mt-4">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <h2 className="text-xl font-medium mb-6 flex items-center">
                                    <MapPin className="h-5 w-5 mr-2 text-amber-500" />
                                    Shipping Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div variants={itemVariants}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                        />
                                        {errors.fullName && (
                                            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                                        )}
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                                        )}
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                                        )}
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                        />
                                        {errors.city && (
                                            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                                        )}
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Province <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="province"
                                            value={formData.province}
                                            onChange={handleInputChange}
                                            className={`w-full border ${errors.province ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                        />
                                        {errors.province && (
                                            <p className="mt-1 text-sm text-red-500">{errors.province}</p>
                                        )}
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Postal Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            className={`w-full border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                        />
                                        {errors.postalCode && (
                                            <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
                                        )}
                                    </motion.div>
                                </div>

                                <div className="mt-8">
                                    <motion.button
                                        onClick={handleProceedToPayment}
                                        disabled={isProcessing}
                                        whileHover={!isProcessing ? { scale: 1.02 } : {}}
                                        whileTap={!isProcessing ? { scale: 0.98 } : {}}
                                        className={`w-full px-6 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center justify-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-5 w-5 mr-2" />
                                                Proceed to Payment
                                            </>
                                        )}
                                    </motion.button>
                                    <p className="text-sm text-gray-500 text-center mt-2">
                                        You will be redirected to Stripe for secure payment
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-medium mb-6 flex items-center">
                                <ShoppingBag className="h-5 w-5 mr-2 text-amber-500" />
                                Order Summary
                            </h2>

                            {/* Order Items */}
                            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.cart_item_id} className="flex justify-between">
                                        <div className="flex items-center">
                                            <span className="text-gray-600 text-sm">{item.quantity} x</span>
                                            <span className="ml-2 text-sm">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Order Totals */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span>${taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className="mt-6 bg-amber-50 p-4 rounded-md">
                                <div className="flex items-start">
                                    <Truck className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">
                                            {shippingCost === 0 ? 'Free shipping!' : `$${shippingCost.toFixed(2)} shipping`}
                                        </p>
                                        <p className="text-xs text-amber-700 mt-1">Estimated delivery: 3-5 business days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
