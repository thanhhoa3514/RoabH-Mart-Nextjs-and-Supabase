'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Package, CreditCard, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
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
        const fetchProfile = async () => {
            if (!user) return;

            try {
                // In a real app, this would fetch from Supabase
                // const { data, error } = await supabase
                //   .from('profiles')
                //   .select('*')
                //   .eq('user_id', user.id)
                //   .single();

                // For now, use mock data
                const mockProfile: Profile = {
                    id: '123',
                    userId: user.id,
                    fullName: user.user_metadata?.full_name || 'John Doe',
                    address: '123 Main St, City, Country',
                    phone: '+1234567890',
                    avatar: 'https://placekitten.com/100/100',
                };

                setProfile(mockProfile);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

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
                                    src={profile?.avatar || 'https://placekitten.com/100/100'}
                                    alt={profile?.fullName || 'User'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">{profile?.fullName}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center w-full p-3 rounded-md transition-colors ${activeTab === 'profile' ? 'bg-primary text-white' : 'hover:bg-gray-100'
                                    }`}
                            >
                                <User className="h-5 w-5 mr-3" />
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center w-full p-3 rounded-md transition-colors ${activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-gray-100'
                                    }`}
                            >
                                <Package className="h-5 w-5 mr-3" />
                                Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('payment')}
                                className={`flex items-center w-full p-3 rounded-md transition-colors ${activeTab === 'payment' ? 'bg-primary text-white' : 'hover:bg-gray-100'
                                    }`}
                            >
                                <CreditCard className="h-5 w-5 mr-3" />
                                Payment Methods
                            </button>
                            <button
                                onClick={() => setActiveTab('wishlist')}
                                className={`flex items-center w-full p-3 rounded-md transition-colors ${activeTab === 'wishlist' ? 'bg-primary text-white' : 'hover:bg-gray-100'
                                    }`}
                            >
                                <Heart className="h-5 w-5 mr-3" />
                                Wishlist
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center w-full p-3 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
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
                                                defaultValue={profile?.fullName}
                                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                defaultValue={user?.email}
                                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                defaultValue={profile?.phone}
                                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Address</label>
                                            <input
                                                type="text"
                                                defaultValue={profile?.address}
                                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-8 pt-8 border-t">
                                    <h3 className="text-lg font-bold mb-4">Change Password</h3>
                                    <form className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Current Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div></div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">Order History</h2>

                                {orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="border rounded-md p-4">
                                                <div className="flex flex-col md:flex-row justify-between mb-4">
                                                    <div>
                                                        <p className="font-medium">Order #{order.id}</p>
                                                        <p className="text-sm text-gray-500">Placed on {order.date}</p>
                                                    </div>
                                                    <div className="mt-2 md:mt-0">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${order.status === 'Delivered'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-gray-500">{order.items} {order.items === 1 ? 'item' : 'items'}</p>
                                                        <p className="font-medium">${order.total.toFixed(2)}</p>
                                                    </div>
                                                    <Link
                                                        href={`/account/orders/${order.id}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                                        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                                        <Link
                                            href="/products"
                                            className="text-primary hover:underline"
                                        >
                                            Start Shopping
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Tab */}
                        {activeTab === 'payment' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">Payment Methods</h2>
                                <div className="text-center py-8">
                                    <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No payment methods</h3>
                                    <p className="text-gray-500 mb-4">You haven't added any payment methods yet.</p>
                                    <button
                                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                                    >
                                        Add Payment Method
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Wishlist Tab */}
                        {activeTab === 'wishlist' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">My Wishlist</h2>
                                <div className="text-center py-8">
                                    <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                                    <p className="text-gray-500 mb-4">Save items you're interested in for later.</p>
                                    <Link
                                        href="/products"
                                        className="text-primary hover:underline"
                                    >
                                        Browse Products
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 