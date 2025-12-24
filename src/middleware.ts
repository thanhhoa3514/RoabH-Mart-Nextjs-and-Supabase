import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/services/supabase/server';

// This middleware protects routes that require authentication
export async function middleware(request: NextRequest) {

    // Chuẩn bị response
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Khởi tạo Supabase client sử dụng shared function
    const supabase = await createClient();

    // Đường dẫn hiện tại
    const pathname = request.nextUrl.pathname;

    // Bỏ qua middleware cho các tài nguyên tĩnh và API
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return response;
    }

    // Xử lý mã xác thực nếu có trong URL (chỉ cho trang callback)
    if (pathname === '/(auth)/callback') {
        const code = request.nextUrl.searchParams.get('code');
        if (code) {
            try {
                await supabase.auth.exchangeCodeForSession(code);
            } catch (error) {
                console.error('Error exchanging auth code:', error);
            }
        }
        return response;
    }

    try {
        // Kiểm tra session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Error getting session:', error);
        }

        const session = data.session;
        const isAuthenticated = !!session;

        // Kiểm tra đường dẫn bảo vệ
        if (pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/checkout')) {
            if (!isAuthenticated) {
                // Chuyển hướng đến trang đăng nhập
                const redirectUrl = new URL('/(auth)/login', request.url);
                const redirectResponse = NextResponse.redirect(redirectUrl);

                // Lưu đường dẫn ban đầu để quay lại sau khi đăng nhập
                redirectResponse.cookies.set('redirectPath', pathname, {
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 10 // 10 phút
                });

                return redirectResponse;
            }
        }

        // Kiểm tra trang xác thực - chuyển hướng nếu đã đăng nhập
        if ((pathname.startsWith('/(auth)/login') || pathname.startsWith('/(auth)/register')) && isAuthenticated) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    } catch (error) {
        console.error('Error in middleware:', error);
    }

    return response;
}

// Configure the middleware to run only on specified routes
export const config = {
    matcher: [
        '/(auth)/callback',
        '/(auth)/login',
        '/(auth)/register',
        '/account/:path*',
        '/orders/:path*',
        '/checkout/:path*'
    ],
};
