import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// This middleware protects routes that require authentication
export async function middleware(request: NextRequest) {
    // Chuẩn bị response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Khởi tạo Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return request.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name, options) {
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                        maxAge: 0,
                    });
                },
            },
        }
    );

    // Xử lý mã xác thực nếu có trong URL (chỉ cho trang callback)
    if (request.nextUrl.pathname === '/auth/callback') {
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

    // Lấy phiên đăng nhập hiện tại
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Đường dẫn hiện tại
    const pathname = request.nextUrl.pathname;

    // Kiểm tra đường dẫn bảo vệ
    if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
        if (!session) {
            // Chuyển hướng đến trang đăng nhập
            const redirectUrl = new URL('/auth/login', request.url);
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

    // Kiểm tra trang xác thực
    if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) && session) {
        // Đã đăng nhập, chuyển hướng đến trang tài khoản
        return NextResponse.redirect(new URL('/account', request.url));
    }

    return response;
}

// Configure the middleware to run only on specified routes
export const config = {
    matcher: [
        '/auth/callback',
        '/auth/login',
        '/auth/register',
        '/account/:path*',
        '/checkout/:path*'
    ],
}; 