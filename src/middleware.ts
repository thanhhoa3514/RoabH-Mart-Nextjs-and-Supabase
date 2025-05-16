import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// This middleware protects routes that require authentication
export async function middleware(request: NextRequest) {
    console.log('Middleware running for path:', request.nextUrl.pathname);
    
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
                    const cookie = request.cookies.get(name);
                    console.log(`Getting cookie ${name}:`, cookie?.value ? 'exists' : 'not found');
                    return cookie?.value;
                },
                set(name, value, options) {
                    console.log(`Setting cookie ${name}`);
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name, options) {
                    console.log(`Removing cookie ${name}`);
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
                console.log('Exchanging auth code for session');
                await supabase.auth.exchangeCodeForSession(code);
                console.log('Code exchange completed');
            } catch (error) {
                console.error('Error exchanging auth code:', error);
            }
        }
        return response;
    }

    try {
        // Lấy phiên đăng nhập hiện tại và làm mới token nếu cần
        await supabase.auth.getUser();
        
        // Log Session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session check result:', {
            hasSession: !!session,
            user: session?.user?.email || 'none'
        });
    
        // Đường dẫn hiện tại
        const pathname = request.nextUrl.pathname;
    
        // Debug: Kiểm tra tất cả cookies
        const allCookies: Record<string, string> = {};
        request.cookies.getAll().forEach(cookie => {
            allCookies[cookie.name] = 'exists';
        });
        console.log('All cookies:', allCookies);
    
        // Bỏ qua middleware cho các tài nguyên tĩnh
        if (
            pathname.startsWith('/_next') || 
            pathname.startsWith('/api') ||
            pathname.includes('.')
        ) {
            console.log('Skipping middleware for static resource');
            return response;
        }
    
        // Kiểm tra đường dẫn bảo vệ
        if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
            if (!session) {
                console.log('No session found, redirecting to login');
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
            console.log('Session found, allowing access to protected route');
        }
    
        // Kiểm tra trang xác thực
        if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) && session) {
            console.log('User already logged in, redirecting to account');
            // Đã đăng nhập, chuyển hướng đến trang tài khoản
            return NextResponse.redirect(new URL('/account', request.url));
        }
    } catch (error) {
        console.error('Error in middleware:', error);
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