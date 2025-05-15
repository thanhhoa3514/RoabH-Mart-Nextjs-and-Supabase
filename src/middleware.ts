import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// This middleware protects routes that require authentication
export async function middleware(request: NextRequest) {
    // Chỉ xử lý đường dẫn /auth/callback
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return request.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    // For reference: https://github.com/vercel/next.js/discussions/50740
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

    // Xử lý mã xác thực nếu có trong URL
    const code = request.nextUrl.searchParams.get('code');
    if (code) {
        try {
            await supabase.auth.exchangeCodeForSession(code);
        } catch (error) {
            console.error('Error exchanging auth code:', error);
        }
    }

    // This will refresh the session if it exists
    await supabase.auth.getSession();

    // Check if the user is authenticated
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Get the pathname from the URL
    const { pathname: urlPathname } = request.nextUrl;

    // Define protected routes
    const protectedRoutes = ['/account', '/checkout'];

    // Define authentication routes
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

    // Check if the route is protected and the user is not authenticated
    const isProtectedRoute = protectedRoutes.some(route => urlPathname.startsWith(route));

    if (isProtectedRoute && !session) {
        // Redirect to login page if trying to access a protected route without authentication
        // Store the intended destination in a cookie instead of URL parameter
        const redirectUrl = new URL('/auth/login', request.url);
        const response = NextResponse.redirect(redirectUrl);
        
        // Store the redirect path in a secure cookie
        if (urlPathname !== '/auth/login') {
            response.cookies.set('redirectPath', urlPathname, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 10 // 10 minutes
            });
        }
        
        return response;
    }

    // Check if the user is already authenticated and trying to access auth routes
    const isAuthRoute = authRoutes.some(route => urlPathname.startsWith(route));

    if (isAuthRoute && session) {
        // Redirect to account page if already authenticated
        return NextResponse.redirect(new URL('/account', request.url));
    }

    return response;
}

// Configure the middleware to run only on specified routes
export const config = {
    matcher: [
        // Protected routes
        '/account/:path*',
        '/checkout/:path*',
        // Auth routes
        '/auth/:path*',
        '/auth/callback'
    ],
}; 