import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// This middleware protects routes that require authentication
export async function middleware(request: NextRequest) {
    console.log('=== START MIDDLEWARE ===');
    console.log('Middleware running for path:', request.nextUrl.pathname);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Chuẩn bị response
    const response = NextResponse.next({
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

    // Đường dẫn hiện tại
    const pathname = request.nextUrl.pathname;

    // Bỏ qua middleware cho các tài nguyên tĩnh và API
    if (
        pathname.startsWith('/_next') || 
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        console.log('Skipping middleware for static resource');
        console.log('=== END MIDDLEWARE ===');
        return response;
    }
    
    // Xử lý mã xác thực nếu có trong URL (chỉ cho trang callback)
    if (pathname === '/auth/callback') {
        console.log('Processing auth callback...');
        
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
        console.log('=== END MIDDLEWARE ===');
        return response;
    }

    try {
        // Kiểm tra session
        console.log('Checking session for path:', pathname);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
        }
        
        const session = data.session;
        const isAuthenticated = !!session;
        
        // Log kết quả kiểm tra phiên
        console.log('Session check result:', {
            hasSession: isAuthenticated,
            user: session?.user?.email || 'none',
            path: pathname,
            error: error ? error.message : null
        });
    
        // Debug: Kiểm tra tất cả cookies
        const allCookies: Record<string, string> = {};
        request.cookies.getAll().forEach(cookie => {
            allCookies[cookie.name] = 'exists';
        });
        console.log('All cookies:', allCookies);
    
        // Kiểm tra đường dẫn bảo vệ
        if (pathname.startsWith('/account') || pathname.startsWith('/myaccount') || pathname.startsWith('/checkout')) {
            console.log('Checking protected route:', pathname, 'Session exists:', isAuthenticated);
            
            if (!isAuthenticated) {
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
                
                console.log('=== END MIDDLEWARE ===');
                return redirectResponse;
            }
            
            console.log('Session found, allowing access to protected route');
        }
    
        // Kiểm tra trang xác thực - chuyển hướng nếu đã đăng nhập
        if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) && isAuthenticated) {
            console.log('User already logged in, redirecting to account');
            console.log('=== END MIDDLEWARE ===');
            return NextResponse.redirect(new URL('/account', request.url));
        }
    } catch (error) {
        console.error('Error in middleware:', error);
    }

    console.log('=== END MIDDLEWARE ===');
    return response;
}

// Configure the middleware to run only on specified routes
export const config = {
    matcher: [
        '/auth/callback',
        '/auth/login',
        '/auth/register',
        '/account/:path*',
        '/myaccount/:path*',
        '/checkout/:path*'
    ],
}; 