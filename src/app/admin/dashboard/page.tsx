'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Bell, Users, ThumbsUp, ShoppingCart, Package, HelpCircle, Loader2 } from 'lucide-react';
import { useAlert } from '@/lib/context/alert-context';
import { getDashboardStats, getTopProducts, getReviewStats, getQuarterlySales } from '@/lib/supabase';

// Animation variants
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.3,
            ease: "easeOut"
        }
    })
};

export default function AdminDashboard() {
    const { showAlert } = useAlert();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for dashboard data
    const [stats, setStats] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [reviewData, setReviewData] = useState({ positive: 0, neutral: 0, negative: 0 });
    const [quarterlyData, setQuarterlyData] = useState<any[]>([]);

    // Fetch dashboard data
    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch dashboard statistics
                const { data: statsData, error: statsError } = await getDashboardStats();
                
                if (statsError) throw statsError;
                
                if (statsData) {
                    // Format stats for display
                    const formattedStats = [
                        { 
                            id: 1, 
                            icon: <Users className="h-6 w-6 text-white" />, 
                            count: statsData.activeUsers.toString(), 
                            label: 'Users Active', 
                            change: statsData.userGrowthRate, 
                            bgColor: 'bg-amber-400' 
                        },
                        { 
                            id: 2, 
                            icon: <ShoppingCart className="h-6 w-6 text-white" />, 
                            count: statsData.totalOrders.toString(), 
                            label: 'Orders', 
                            change: statsData.orderGrowth, 
                            bgColor: 'bg-gray-800' 
                        },
                        { 
                            id: 3, 
                            icon: <Package className="h-6 w-6 text-white" />, 
                            count: statsData.totalProducts.toString(), 
                            label: 'Products', 
                            change: statsData.productGrowth, 
                            bgColor: 'bg-gray-800' 
                        },
                        { 
                            id: 4, 
                            icon: <ThumbsUp className="h-6 w-6 text-white" />, 
                            count: statsData.totalUsers.toString(), 
                            label: 'Total Users', 
                            change: statsData.userGrowthRate, 
                            bgColor: 'bg-gray-800' 
                        },
                    ];
                    setStats(formattedStats);
                }
                
                // Fetch top products
                const { data: productsData, error: productsError } = await getTopProducts();
                
                if (productsError) throw productsError;
                setProducts(productsData || []);
                
                // Fetch review stats
                const { data: reviewsData, error: reviewsError } = await getReviewStats();
                
                if (reviewsError) throw reviewsError;
                setReviewData(reviewsData || { positive: 75, neutral: 20, negative: 5 });
                
                // Fetch quarterly sales data
                const { data: salesData, error: salesError } = await getQuarterlySales();
                
                if (salesError) throw salesError;
                setQuarterlyData(salesData || []);
                
            } catch (err) {
                console.error('Dashboard data fetch error:', err);
                setError('Failed to load dashboard data');
                showAlert('error', 'Failed to load dashboard data', 3000);
            } finally {
                setLoading(false);
            }
        }
        
        fetchDashboardData();
    }, [showAlert]);

    const handleNotificationClick = () => {
        showAlert('info', 'You have 3 new notifications', 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center text-sm">
                    <Link href="/admin" className="text-gray-500">Page</Link>
                    <span className="mx-2">/</span>
                    <span className="font-medium">Dashboard</span>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="pl-10 pr-4 py-2 rounded-full bg-amber-50 border-none focus:outline-none focus:ring-2 focus:ring-amber-300 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-gray-700">Welcome, Admin</span>
                        <div className="w-10 h-5 bg-gray-300 rounded-full flex items-center px-1">
                            <motion.div
                                className="w-4 h-4 rounded-full bg-purple-600"
                                animate={{ x: 16 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                        </div>
                    </div>

                    <motion.button
                        className="relative"
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNotificationClick}
                    >
                        <Bell className="h-6 w-6 text-gray-700" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            3
                        </span>
                    </motion.button>
                </div>
            </div>

            {/* Dashboard label */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-amber-500">Dashboard</h1>
            </div>

            {/* Error display */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                    <button 
                        className="mt-2 text-sm bg-red-100 px-3 py-1 rounded-md hover:bg-red-200"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className={`${stat.bgColor} rounded-lg p-6 text-white shadow-md`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-3 bg-white bg-opacity-20 rounded-full">
                                {stat.icon}
                            </div>
                            <span className="text-sm">{stat.change}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stat.count}</h3>
                        <p className="text-white text-opacity-80">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Reviews and Products Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Top Products Table - Takes 2/3 width on large screens */}
                <motion.div
                    className="bg-white rounded-lg shadow-md p-6 lg:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <h2 className="text-lg font-semibold mb-4">Top Products</h2>

                    {products.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No products found.
                        </div>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">#</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">NAME</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">CATEGORY</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">PRICE</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <motion.tr
                                        key={product.id}
                                        custom={index}
                                        initial="hidden"
                                        animate="visible"
                                        variants={tableRowVariants}
                                        className="border-b"
                                    >
                                        <td className="py-3 px-4 text-sm">{String(product.id).padStart(2, '0')}</td>
                                        <td className="py-3 px-4 text-sm">{product.name}</td>
                                        <td className="py-3 px-4 text-sm">{product.category}</td>
                                        <td className="py-3 px-4 text-sm">{product.price}</td>
                                        <td className="py-3 px-4">
                                            {product.status ? (
                                                <div className="flex items-center">
                                                    <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                                                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-5 w-5 rounded-full bg-red-500"></div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </motion.div>

                {/* Reviews Section - Takes 1/3 width on large screens */}
                <motion.div
                    className="bg-white rounded-lg shadow-md p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <h2 className="text-lg font-semibold mb-4">Reviews</h2>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm">Positive Review</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                                <motion.div
                                    className="h-full bg-amber-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${reviewData.positive}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                ></motion.div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm">Neutral Reviews</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                                <motion.div
                                    className="h-full bg-amber-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${reviewData.neutral}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                ></motion.div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm">Negative Reviews</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                                <motion.div
                                    className="h-full bg-amber-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${reviewData.negative}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                                ></motion.div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>Customer reviews summary</p>
                        <p>based on user feedback</p>
                    </div>

                    <button className="mt-4 w-full py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
                        View all reviews
                    </button>
                </motion.div>
            </div>

            {/* Target and Reality Chart */}
            <motion.div
                className="bg-white rounded-lg shadow-md p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Target and Reality</h2>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <HelpCircle className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {quarterlyData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No quarterly data available.
                    </div>
                ) : (
                <div className="flex justify-between h-64">
                    {quarterlyData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center justify-end h-full w-1/4">
                            <div className="flex space-x-4 h-5/6">
                                <motion.div
                                    className="w-8 bg-red-400 rounded-t-md"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${data.target}%` }}
                                    transition={{ duration: 1, delay: 0.1 * index }}
                                ></motion.div>
                                <motion.div
                                    className="w-8 bg-amber-400 rounded-t-md"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${data.reality}%` }}
                                    transition={{ duration: 1, delay: 0.1 * index + 0.2 }}
                                ></motion.div>
                            </div>
                            <p className="mt-2 text-sm">{data.quarter}</p>
                        </div>
                    ))}
                </div>
                )}

                <div className="mt-6 flex justify-around">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-400 mr-2"></div>
                        <span className="text-sm">Target Sales</span>
                        <span className="text-xs text-gray-500 ml-1">Commercial</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-amber-400 mr-2"></div>
                        <span className="text-sm">Reality Sales</span>
                        <span className="text-xs text-gray-500 ml-1">Global</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
} 