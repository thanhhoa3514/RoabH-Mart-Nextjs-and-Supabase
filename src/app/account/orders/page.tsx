'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ShoppingBag, ChevronRight, Package, Clock, Ban } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getOrdersByUserId } from '@/lib/supabase';
import { useAlert } from '@/lib/context/alert-context';
import { getUserId } from '@/lib/helpers/user-helpers';

// Định dạng trạng thái đơn hàng thành tiếng Việt
const orderStatusMap: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
    'pending': {
        text: 'Chờ xác nhận',
        color: 'text-yellow-600 bg-yellow-50',
        icon: <Clock className="w-4 h-4" />
    },
    'processing': {
        text: 'Đang xử lý',
        color: 'text-blue-600 bg-blue-50',
        icon: <Package className="w-4 h-4" />
    },
    'shipped': {
        text: 'Đang giao hàng',
        color: 'text-green-600 bg-green-50',
        icon: <ShoppingBag className="w-4 h-4" />
    },
    'delivered': {
        text: 'Đã giao hàng',
        color: 'text-green-600 bg-green-50',
        icon: <ShoppingBag className="w-4 h-4" />
    },
    'cancelled': {
        text: 'Đã hủy',
        color: 'text-red-600 bg-red-50',
        icon: <Ban className="w-4 h-4" />
    }
};

export default function OrdersPage() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const { user, userData, loading: authLoading } = useAuth();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasChecked, setHasChecked] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

    // Tải danh sách đơn hàng
    useEffect(() => {
        // Nếu đã biết không có đơn hàng và trang hiện tại là 1, không cần tải lại
        if (hasChecked && orders.length === 0 && currentPage === 1) {
            setLoading(false);
            return;
        }
        
        // Nếu chuyển trang hoặc có thay đổi về user/userData, cần tải lại
        loadOrders();
    }, [user, userData, authLoading, currentPage, pageSize, router, showAlert, hasChecked, orders.length]);

    async function loadOrders() {
        if (authLoading) return;
        
        if (!user || !userData) {
            // Nếu không có người dùng đăng nhập, chuyển hướng về trang đăng nhập
            showAlert('error', 'Vui lòng đăng nhập để xem đơn hàng của bạn', 3000);
            router.push('/auth/login');
            return;
        }

        // Debug user data
        console.log('User data from auth context:', {
            user,
            userData,
            userIdFromUserData: userData?.user?.user_id
        });

        try {
            setLoading(true);
            // Lấy user_id từ userData
            const userId = getUserId(userData);
            
            if (!userId) {
                showAlert('error', 'Không tìm thấy thông tin người dùng', 3000);
                setHasChecked(true);
                setLoading(false);
                return;
            }

            const { data, error, count } = await getOrdersByUserId(userId, currentPage, pageSize);
            
            if (error) {
                console.error('Error fetching orders:', error);
                showAlert('error', 'Không thể tải đơn hàng: ' + error.message, 3000);
                setHasChecked(true);
                setLoading(false);
                return;
            }
            
            setOrders(data || []);
            setHasChecked(true);
            
            if (count !== null) {
                setTotalPages(Math.ceil(count / pageSize));
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            showAlert('error', 'Đã xảy ra lỗi khi tải đơn hàng', 3000);
        } finally {
            setLoading(false);
        }
    }

    const changePage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Reset trạng thái để tải lại dữ liệu
    const refreshOrders = () => {
        setHasChecked(false);
        setCurrentPage(1);  // Quay lại trang đầu tiên
    };

    // Format tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount)
            .replace('₫', 'VNĐ');
    };

    // Nếu đang tải
    if (loading || authLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>
                <div className="bg-white p-8 rounded-lg shadow">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

            {/* Nếu không có đơn hàng */}
            {orders.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng nào</h3>
                    <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                        >
                            Mua sắm ngay
                        </Link>
                        <button
                            onClick={refreshOrders}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            {loading ? 'Đang tải...' : 'Làm mới'}
                        </button>
                    </div>
                </div>
            ) : (
                /* Danh sách đơn hàng */
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {orders.map((order) => (
                            <li key={order.order_id} className="p-4 hover:bg-gray-50">
                                <Link href={`/account/orders/${order.order_id}`} className="block">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-lg font-medium text-gray-900">
                                                    Đơn hàng #{order.order_number}
                                                </h4>
                                                <div className="flex items-center">
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>

                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        <time dateTime={order.order_date}>
                                                            {format(new Date(order.order_date), 'dd/MM/yyyy HH:mm')}
                                                        </time>
                                                    </p>
                                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                        {formatCurrency(order.total_amount)}
                                                    </p>
                                                </div>

                                                <div className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs flex items-center gap-1 ${orderStatusMap[order.status]?.color || 'text-gray-600 bg-gray-100'}`}>
                                                    {orderStatusMap[order.status]?.icon}
                                                    {orderStatusMap[order.status]?.text || order.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6">
                    <nav className="flex items-center space-x-2">
                        <button
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-2 py-1 rounded ${currentPage === 1 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                        >
                            Trước
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => changePage(i + 1)}
                                className={`px-3 py-1 rounded ${currentPage === i + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'text-blue-600 hover:bg-blue-100'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-2 py-1 rounded ${currentPage === totalPages ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                        >
                            Sau
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}