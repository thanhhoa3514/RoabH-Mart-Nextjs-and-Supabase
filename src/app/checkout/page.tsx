'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    CreditCard,
    MapPin,
    Package,
    Truck,
    ShoppingBag,
    Check,
    Loader2
} from 'lucide-react';
import { useAlert } from '@/providers/alert-provider';
import { useAuth } from '@/providers/auth-provider';
import { createOrder } from '@/services/supabase';
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

export default function CheckoutPage() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const { userData } = useAuth();

    // Mock cart data - would normally be fetched from the server or state management
    const [cart] = useState({
        items: [
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
        ],
        subtotal: 1499.98,
        tax: 149.99,
        shipping: 15.00,
        total: 1664.97
    });

    // Form state
    const [formData, setFormData] = useState({
        // Shipping details
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',

        // Payment method
        paymentMethod: 'credit-card',

        // Credit card details
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const validateStep1 = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.province.trim()) newErrors.province = 'Province is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: { [key: string]: string } = {};

        if (formData.paymentMethod === 'credit-card') {
            if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
            if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';
            if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
            if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        console.log('Bắt đầu đặt hàng');

        try {
            // Lấy user_id từ context auth thay vì hardcode
            let userId;

            if (userData?.user?.user_id) {
                userId = userData.user.user_id;
                console.log('User ID từ auth:', userId);
            } else {
                // Fallback nếu không có người dùng đăng nhập
                userId = 1; // User ID mặc định cho demo
                console.log('Không tìm thấy user ID từ auth, sử dụng ID mặc định:', userId);
            }

            // Prepare order data for Supabase
            const orderData = {
                user_id: userId,
                total_amount: cart.total,
                items: cart.items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price
                })),
                shipping_info: {
                    shipping_method: 'Standard Shipping',
                    shipping_cost: cart.shipping
                },
                payment_info: {
                    payment_method: formData.paymentMethod === 'credit-card'
                        ? 'Credit Card'
                        : 'Cash on Delivery',
                    amount: cart.total
                }
            };
            console.log('Order data:', orderData);

            // Create order in Supabase
            console.log('Gọi API createOrder...');
            const { data, error } = await createOrder(orderData);
            console.log('Kết quả API:', { data, error });

            if (error) {
                throw new Error(error.message || 'Failed to create order');
            }

            // Get the order number to pass to the confirmation page
            const orderNumber = data?.order?.order_number || '123456';

            showAlert('success', 'Order placed successfully!', 3000);

            // Redirect to order confirmation page with the actual order number
            router.push(`/order-confirmation?id=${orderNumber}`);

        } catch (error) {
            console.error('Order placement error:', error);
            showAlert('error', error instanceof Error ? error.message : 'Failed to process order. Please try again.', 5000);
        } finally {
            setIsProcessing(false);
        }
    };

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

                {/* Checkout Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}>
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-amber-500' : 'bg-gray-200'}`} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}>
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-amber-500' : 'bg-gray-200'}`} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}>
                            <Check className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="flex items-center justify-center mt-2 text-sm">
                        <div className={`w-24 text-center ${currentStep >= 1 ? 'text-amber-500 font-medium' : 'text-gray-500'}`}>
                            Shipping
                        </div>
                        <div className="w-24 text-center" />
                        <div className={`w-24 text-center ${currentStep >= 2 ? 'text-amber-500 font-medium' : 'text-gray-500'}`}>
                            Payment
                        </div>
                        <div className="w-24 text-center" />
                        <div className={`w-24 text-center ${currentStep >= 3 ? 'text-amber-500 font-medium' : 'text-gray-500'}`}>
                            Confirmation
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {/* Step 1: Shipping Details */}
                            {currentStep === 1 && (
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

                                    <div className="mt-8 flex justify-end">
                                        <motion.button
                                            onClick={handleNextStep}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                        >
                                            Continue to Payment
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Payment Method */}
                            {currentStep === 2 && (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <h2 className="text-xl font-medium mb-6 flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2 text-amber-500" />
                                        Payment Method
                                    </h2>

                                    <div className="space-y-4">
                                        <motion.div variants={itemVariants}>
                                            <div className="flex items-center mb-4">
                                                <input
                                                    id="credit-card"
                                                    name="paymentMethod"
                                                    type="radio"
                                                    value="credit-card"
                                                    checked={formData.paymentMethod === 'credit-card'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                                                />
                                                <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                                                    Credit Card
                                                </label>
                                            </div>

                                            <div className="flex items-center mb-4">
                                                <input
                                                    id="cash-on-delivery"
                                                    name="paymentMethod"
                                                    type="radio"
                                                    value="cash-on-delivery"
                                                    checked={formData.paymentMethod === 'cash-on-delivery'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                                                />
                                                <label htmlFor="cash-on-delivery" className="ml-3 block text-sm font-medium text-gray-700">
                                                    Cash on Delivery
                                                </label>
                                            </div>
                                        </motion.div>

                                        {formData.paymentMethod === 'credit-card' && (
                                            <motion.div
                                                variants={containerVariants}
                                                className="bg-gray-50 p-4 rounded-md"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <motion.div variants={itemVariants} className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Card Number <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="cardNumber"
                                                            value={formData.cardNumber}
                                                            onChange={handleInputChange}
                                                            placeholder="1234 5678 9012 3456"
                                                            className={`w-full border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                                        />
                                                        {errors.cardNumber && (
                                                            <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
                                                        )}
                                                    </motion.div>

                                                    <motion.div variants={itemVariants} className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Name on Card <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="cardName"
                                                            value={formData.cardName}
                                                            onChange={handleInputChange}
                                                            className={`w-full border ${errors.cardName ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                                        />
                                                        {errors.cardName && (
                                                            <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>
                                                        )}
                                                    </motion.div>

                                                    <motion.div variants={itemVariants}>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Expiry Date <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="expiryDate"
                                                            value={formData.expiryDate}
                                                            onChange={handleInputChange}
                                                            placeholder="MM/YY"
                                                            className={`w-full border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                                        />
                                                        {errors.expiryDate && (
                                                            <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
                                                        )}
                                                    </motion.div>

                                                    <motion.div variants={itemVariants}>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            CVV <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="cvv"
                                                            value={formData.cvv}
                                                            onChange={handleInputChange}
                                                            placeholder="123"
                                                            className={`w-full border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-amber-300`}
                                                        />
                                                        {errors.cvv && (
                                                            <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                                                        )}
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="mt-8 flex justify-between">
                                        <motion.button
                                            onClick={handlePreviousStep}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                        >
                                            Back to Shipping
                                        </motion.button>

                                        <motion.button
                                            onClick={handleNextStep}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                        >
                                            Review Order
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Order Confirmation */}
                            {currentStep === 3 && (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <h2 className="text-xl font-medium mb-6 flex items-center">
                                        <Check className="h-5 w-5 mr-2 text-amber-500" />
                                        Review Your Order
                                    </h2>

                                    {/* Shipping Information Summary */}
                                    <motion.div variants={itemVariants} className="mb-6">
                                        <h3 className="text-md font-medium mb-2 flex items-center">
                                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                            Shipping Information
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm">{formData.fullName}</p>
                                            <p className="text-sm">{formData.email}</p>
                                            <p className="text-sm">{formData.phone}</p>
                                            <p className="text-sm">{formData.address}</p>
                                            <p className="text-sm">{formData.city}, {formData.province} {formData.postalCode}</p>
                                        </div>
                                    </motion.div>

                                    {/* Payment Method Summary */}
                                    <motion.div variants={itemVariants} className="mb-6">
                                        <h3 className="text-md font-medium mb-2 flex items-center">
                                            <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                                            Payment Method
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            {formData.paymentMethod === 'credit-card' ? (
                                                <div>
                                                    <p className="text-sm font-medium">Credit Card</p>
                                                    <p className="text-sm">**** **** **** {formData.cardNumber.slice(-4) || '1234'}</p>
                                                    <p className="text-sm">{formData.cardName || 'Card Holder'}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm font-medium">Cash on Delivery</p>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Order Items Summary */}
                                    <motion.div variants={itemVariants} className="mb-6">
                                        <h3 className="text-md font-medium mb-2 flex items-center">
                                            <Package className="h-4 w-4 mr-2 text-gray-500" />
                                            Order Items
                                        </h3>

                                        <div className="space-y-4">
                                            {cart.items.map(item => (
                                                <div key={item.id} className="flex items-center border-b pb-4">
                                                    <div className="h-16 w-16 relative overflow-hidden rounded-md">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="object-cover"
                                                            fill
                                                        />
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <div className="font-medium">
                                                        ${item.price.toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    <div className="mt-8 flex justify-between">
                                        <motion.button
                                            onClick={handlePreviousStep}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                        >
                                            Back to Payment
                                        </motion.button>

                                        <motion.button
                                            onClick={handlePlaceOrder}
                                            disabled={isProcessing}
                                            whileHover={!isProcessing ? { scale: 1.05 } : {}}
                                            whileTap={!isProcessing ? { scale: 0.95 } : {}}
                                            className={`px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    Place Order
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
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
                            <div className="space-y-3 mb-6">
                                {cart.items.map(item => (
                                    <div key={item.id} className="flex justify-between">
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
                                    <span>${cart.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>${cart.shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span>${cart.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>${cart.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className="mt-6 bg-amber-50 p-4 rounded-md">
                                <div className="flex items-start">
                                    <Truck className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">Free shipping on orders over $100</p>
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
