'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartItem, Product } from '@/types';

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Calculate cart totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 10 : 0;
    const total = subtotal + shipping;

    useEffect(() => {
        // In a real app, this would fetch from local storage, context, or API
        // Simulating API call with mock data
        setLoading(true);

        // Mock data
        const mockProducts: Product[] = [
            {
                id: '1',
                name: 'Wireless Earbuds',
                description: 'High-quality wireless earbuds with noise cancellation',
                price: 79.99,
                images: ['https://placekitten.com/300/300'],
                category: 'electronics',
                stock: 15,
                createdAt: '2023-01-15',
                updatedAt: '2023-01-15'
            },
            {
                id: '3',
                name: 'Smart Watch',
                description: 'Feature-rich smart watch with health monitoring',
                price: 199.99,
                images: ['https://placekitten.com/302/300'],
                category: 'electronics',
                stock: 8,
                createdAt: '2023-03-05',
                updatedAt: '2023-03-05'
            },
        ];

        const mockCartItems: CartItem[] = [
            {
                productId: '1',
                product: mockProducts[0],
                quantity: 1
            },
            {
                productId: '3',
                product: mockProducts[1],
                quantity: 2
            }
        ];

        setTimeout(() => {
            setCartItems(mockCartItems);
            setLoading(false);
        }, 500);
    }, []);

    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.productId === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const handleRemoveItem = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
                <div className="animate-pulse">
                    <div className="h-24 bg-gray-100 rounded-md mb-4"></div>
                    <div className="h-24 bg-gray-100 rounded-md mb-4"></div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
                <div className="text-center py-16">
                    <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added any products to your cart yet.</p>
                    <Link
                        href="/products"
                        className="bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b">
                            <div className="col-span-6">
                                <h2 className="font-medium">Product</h2>
                            </div>
                            <div className="col-span-2 text-center">
                                <h2 className="font-medium">Price</h2>
                            </div>
                            <div className="col-span-2 text-center">
                                <h2 className="font-medium">Quantity</h2>
                            </div>
                            <div className="col-span-2 text-right">
                                <h2 className="font-medium">Total</h2>
                            </div>
                        </div>

                        {/* Items */}
                        {cartItems.map((item) => (
                            <div key={item.productId} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b">
                                {/* Product */}
                                <div className="col-span-1 md:col-span-6 flex items-center">
                                    <div className="relative w-16 h-16 mr-4">
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">
                                            <Link href={`/products/${item.productId}`} className="hover:text-primary">
                                                {item.product.name}
                                            </Link>
                                        </h3>
                                        <button
                                            onClick={() => handleRemoveItem(item.productId)}
                                            className="text-sm text-red-500 flex items-center mt-1 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="col-span-1 md:col-span-2 flex md:justify-center items-center">
                                    <span className="md:hidden font-medium mr-2">Price:</span>
                                    <span>${item.product.price.toFixed(2)}</span>
                                </div>

                                {/* Quantity */}
                                <div className="col-span-1 md:col-span-2 flex md:justify-center items-center">
                                    <span className="md:hidden font-medium mr-2">Quantity:</span>
                                    <div className="flex items-center border rounded-md">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                            className="px-2 py-1 border-r hover:bg-gray-100"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="px-3 py-1">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                            className="px-2 py-1 border-l hover:bg-gray-100"
                                            disabled={item.quantity >= item.product.stock}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="col-span-1 md:col-span-2 flex md:justify-end items-center">
                                    <span className="md:hidden font-medium mr-2">Total:</span>
                                    <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="block w-full bg-primary text-white text-center py-3 rounded-md mt-6 hover:bg-opacity-90 transition-colors"
                        >
                            Proceed to Checkout
                        </Link>

                        <Link
                            href="/products"
                            className="block w-full text-center py-3 mt-4 hover:text-primary transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 