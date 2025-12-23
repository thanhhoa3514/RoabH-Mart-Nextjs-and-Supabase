'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, Package, CreditCard, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const { user, userData, signOut } = useAuth();
    const [loading, setLoading] = useState(true);

    // Mock order data
    const orders = [
        {
            id: 'ORD-1234',
            date: '2023-05-15',
            status: 'Delivered',
            total: 279.97,
            items: 3
        },
        {
            id: 'ORD-5678',
            date: '2023-04-20',
            status: 'Processing',
            total: 149.99,
            items: 1
        }
    ];

    useEffect(() => {
        // When userData is loaded, set loading to false
        if (user) {
            setLoading(false);
        }
    }, [user, userData]);

    const handleSignOut = async () => {
        await signOut();
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">My Account</h1>
                <div className="animate-pulse">
                    <div className="h-32 bg-gray-100 rounded-md mb-4"></div>
                    <div className="h-64 bg-gray-100 rounded-md"></div>
                </div>
            </div>
        );
    }

    // Format the user's name for display
    const displayName = user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] ||
        'User';

    // Get the profile image if available
    const profileImage = user?.user_metadata?.profile_image || 'https://placekitten.com/100/100';

    // Get the default address if available
    const defaultAddress = userData?.addresses?.find(addr => addr.is_default) || userData?.addresses?.[0];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-1/4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {/* User Info */}
                        <div className="flex items-center mb-6">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                                <Image
                                    src={profileImage}
                                    alt={displayName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">{displayName}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center w-full px-4 py-2 rounded-md transition ${activeTab === 'profile'
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-gray-100'
                                    }`}
                            >
                                <User className="mr-3 h-5 w-5" />
                                <span>Profile</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center w-full px-4 py-2 rounded-md transition ${activeTab === 'orders'
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-gray-100'
                                    }`}
                            >
                                <Package className="mr-3 h-5 w-5" />
                                <span>Orders</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('payment')}
                                className={`flex items-center w-full px-4 py-2 rounded-md transition ${activeTab === 'payment'
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-gray-100'
                                    }`}
                            >
                                <CreditCard className="mr-3 h-5 w-5" />
                                <span>Payment Methods</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('wishlist')}
                                className={`flex items-center w-full px-4 py-2 rounded-md transition ${activeTab === 'wishlist'
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-gray-100'
                                    }`}
                            >
                                <Heart className="mr-3 h-5 w-5" />
                                <span>Wishlist</span>
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center w-full px-4 py-2 text-red-500 rounded-md hover:bg-red-50 transition"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                <span>Sign Out</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="w-full md:w-3/4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                defaultValue={user?.user_metadata?.full_name || ''}
                                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                defaultValue={user?.email || ''}
                                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                defaultValue={user?.user_metadata?.phone_number || ''}
                                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                defaultValue={user?.user_metadata?.date_of_birth ? new Date(user.user_metadata.date_of_birth).toISOString().split('T')[0] : ''}
                                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Default Address</label>
                                        <textarea
                                            defaultValue={defaultAddress ?
                                                `${defaultAddress.street_address}, ${defaultAddress.city}, ${defaultAddress.province || ''} ${defaultAddress.postal_code}, ${defaultAddress.country}` :
                                                ''}
                                            rows={3}
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">Order History</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.id}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {order.date}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                                }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        ${order.total.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <a
                                                            href="#"
                                                            className="text-primary hover:text-primary-dark"
                                                        >
                                                            View
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Payment Methods Tab */}
                        {activeTab === 'payment' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">Payment Methods</h2>
                                <div className="space-y-4">
                                    <div className="border rounded-md p-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="bg-gray-100 p-3 rounded-md mr-4">
                                                <CreditCard className="h-6 w-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Visa ending in 4242</p>
                                                <p className="text-sm text-gray-500">Expires 04/25</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-4">
                                                Default
                                            </span>
                                            <button className="text-gray-500 hover:text-gray-700">Edit</button>
                                        </div>
                                    </div>

                                    <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400 transition">
                                        + Add Payment Method
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Wishlist Tab */}
                        {activeTab === 'wishlist' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">My Wishlist</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border rounded-md p-4 flex">
                                        <div className="relative w-20 h-20 mr-4">
                                            <Image
                                                src="https://placehold.co/100x100"
                                                alt="Product"
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">Wireless Earbuds</h3>
                                            <p className="text-gray-500 text-sm">$79.99</p>
                                            <div className="flex justify-between mt-2">
                                                <button className="text-primary hover:text-primary-dark text-sm">
                                                    Add to Cart
                                                </button>
                                                <button className="text-red-500 hover:text-red-700 text-sm">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border rounded-md p-4 flex">
                                        <div className="relative w-20 h-20 mr-4">
                                            <Image
                                                src="https://placehold.co/100x100"
                                                alt="Product"
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">Smart Watch</h3>
                                            <p className="text-gray-500 text-sm">$149.99</p>
                                            <div className="flex justify-between mt-2">
                                                <button className="text-primary hover:text-primary-dark text-sm">
                                                    Add to Cart
                                                </button>
                                                <button className="text-red-500 hover:text-red-700 text-sm">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 
