'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, CircleCheck, Package, Truck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getOrderById } from '@/lib/supabase';
import { useAlert } from '@/lib/context/alert-context';
import { getUserId } from '@/lib/helpers/user-helpers';

// Định dạng trạng thái đơn hàng thành tiếng Việt
const orderStatusMap: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
  'pending': { 
    text: 'Chờ xác nhận', 
    color: 'text-yellow-600 border-yellow-600', 
    icon: <Package className="w-6 h-6" /> 
  },
  'processing': { 
    text: 'Đang xử lý', 
    color: 'text-blue-600 border-blue-600', 
    icon: <Package className="w-6 h-6" /> 
  },
  'shipped': { 
    text: 'Đang giao hàng', 
    color: 'text-purple-600 border-purple-600', 
    icon: <Truck className="w-6 h-6" /> 
  },
  'delivered': { 
    text: 'Đã giao hàng', 
    color: 'text-green-600 border-green-600', 
    icon: <CheckCircle2 className="w-6 h-6" /> 
  },
  'cancelled': { 
    text: 'Đã hủy', 
    color: 'text-red-600 border-red-600', 
    icon: <Package className="w-6 h-6" /> 
  }
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert } = useAlert();
  const { user, userData, loading: authLoading } = useAuth();
  
  const [orderData, setOrderData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = params?.id ? parseInt(params.id as string, 10) : NaN;

  // Format tiền tệ
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };

  // Tải dữ liệu đơn hàng
  useEffect(() => {
    async function loadOrderDetails() {
      if (authLoading) return;
      
      if (!user || !userData) {
        // Nếu không có người dùng đăng nhập, chuyển hướng về trang đăng nhập
        showAlert('error', 'Vui lòng đăng nhập để xem đơn hàng', 3000);
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        
        // Kiểm tra order ID có hợp lệ không
        if (isNaN(orderId)) {
          showAlert('error', 'Mã đơn hàng không hợp lệ', 3000);
          router.push('/account/orders');
          return;
        }

        const { data, error } = await getOrderById(orderId);
        
        if (error) {
          console.error('Error fetching order details:', error);
          showAlert('error', 'Không thể tải thông tin đơn hàng: ' + error.message, 3000);
          router.push('/account/orders');
          return;
        }
        
        // Kiểm tra xem đơn hàng có thuộc về người dùng hiện tại không
        const userId = getUserId(userData);
        if (data?.order && data.order.user_id !== userId) {
          showAlert('error', 'Bạn không có quyền xem đơn hàng này', 3000);
          router.push('/account/orders');
          return;
        }
        
        setOrderData(data);
      } catch (error) {
        console.error('Unexpected error:', error);
        showAlert('error', 'Đã xảy ra lỗi khi tải đơn hàng', 3000);
        router.push('/account/orders');
      } finally {
        setLoading(false);
      }
    }

    loadOrderDetails();
  }, [user, userData, authLoading, orderId, router, showAlert]);

  // Khi đang tải
  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/account/orders" className="text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        </div>
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

  // Nếu không có dữ liệu đơn hàng
  if (!orderData || !orderData.order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/account/orders" className="text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        </div>
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
          <p className="text-gray-500 mb-4">Đơn hàng không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/account/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
          >
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const { order, orderItems = [], payment, shipping, user: orderUser } = orderData;
  const status = order.status;
  const statusInfo = orderStatusMap[status] || {
    text: status,
    color: 'text-gray-600 border-gray-600',
    icon: <Package className="w-6 h-6" />
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/account/orders" className="text-gray-600 hover:text-gray-900 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.order_number}</h1>
      </div>
      
      {/* Trạng thái đơn hàng */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-full border-2 ${statusInfo.color} mr-4`}>
              {statusInfo.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold">Trạng thái đơn hàng</h2>
              <p className={`text-lg ${statusInfo.color.split(' ')[0]}`}>{statusInfo.text}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Ngày đặt hàng</p>
            <p className="font-medium">{format(new Date(order.order_date), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>
      </div>
      
      {/* Thông tin đơn hàng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Cột 1: Thông tin thanh toán */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Thông tin thanh toán</h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Tổng tiền sản phẩm</p>
              <p className="font-medium">{formatCurrency(order.total_amount)}</p>
            </div>
            {shipping && (
              <div>
                <p className="text-sm text-gray-500">Phí vận chuyển</p>
                <p className="font-medium">{formatCurrency(shipping.shipping_cost)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Tổng thanh toán</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(order.total_amount + (shipping?.shipping_cost || 0))}
              </p>
            </div>
            {payment && (
              <div className="pt-2 mt-2 border-t">
                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                <p className="font-medium">{payment.payment_method}</p>
                <p className="text-sm text-gray-500 mt-2">Trạng thái thanh toán</p>
                <p className={payment.status === 'paid' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                  {payment.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Cột 2: Thông tin vận chuyển */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Thông tin vận chuyển</h2>
          {shipping ? (
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Phương thức vận chuyển</p>
                <p className="font-medium">{shipping.shipping_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái vận chuyển</p>
                <p className="font-medium">
                  {shipping.status === 'delivered' ? 'Đã giao hàng' : 
                   shipping.status === 'shipped' ? 'Đang vận chuyển' : 
                   shipping.status === 'processing' ? 'Đang xử lý' : 'Chờ xử lý'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                <p className="font-medium">{shipping.delivery_address || 'Không có thông tin'}</p>
              </div>
              {shipping.tracking_number && (
                <div>
                  <p className="text-sm text-gray-500">Mã vận đơn</p>
                  <p className="font-medium">{shipping.tracking_number}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Không có thông tin vận chuyển</p>
          )}
        </div>
        
        {/* Cột 3: Thông tin khách hàng */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Thông tin khách hàng</h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Họ tên</p>
              <p className="font-medium">{orderUser?.username || userData?.user?.username || 'Không có thông tin'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{orderUser?.email || userData?.user?.email || 'Không có thông tin'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số điện thoại</p>
              <p className="font-medium">{orderUser?.phone || userData?.profile?.phone_number || 'Không có thông tin'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Danh sách sản phẩm */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <h2 className="text-lg font-semibold p-6 border-b">Sản phẩm đã mua</h2>
        
        {orderItems.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Không có sản phẩm nào trong đơn hàng này</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {orderItems.map((item: any) => (
              <li key={item.order_item_id} className="p-6 flex flex-wrap md:flex-nowrap">
                <div className="w-full md:w-auto md:flex-shrink-0 mb-4 md:mb-0 md:mr-4">
                  {item.products?.image ? (
                    <Image
                      src={item.products.image}
                      alt={item.products?.name || 'Sản phẩm'}
                      width={80}
                      height={80}
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.products?.name || 'Sản phẩm không xác định'}
                  </h3>
                  <div className="flex flex-wrap justify-between mt-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        Đơn giá: {formatCurrency(item.unit_price)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Nút điều hướng */}
      <div className="flex justify-between">
        <Link
          href="/account/orders"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách đơn hàng
        </Link>
        
        {order.status === 'pending' && (
          <button
            onClick={() => {
              // Thêm logic hủy đơn hàng ở đây
              showAlert('info', 'Tính năng hủy đơn hàng đang được phát triển', 3000);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Hủy đơn hàng
          </button>
        )}
      </div>
    </div>
  );
} 