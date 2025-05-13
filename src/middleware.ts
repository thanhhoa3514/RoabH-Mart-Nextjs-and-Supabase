import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// This middleware protects routes that require authentication
export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession();

    // Check if the user is authenticated
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Get the pathname from the URL
    const { pathname } = req.nextUrl;

    // Define protected routes
    const protectedRoutes = ['/account', '/checkout'];

    // Define authentication routes
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

    // Check if the route is protected and the user is not authenticated
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !session) {
        // Redirect to login page if trying to access a protected route without authentication
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Check if the user is already authenticated and trying to access auth routes
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    if (isAuthRoute && session) {
        // Redirect to account page if already authenticated
        return NextResponse.redirect(new URL('/account', req.url));
    }

    return res;
}

// Configure the middleware to run only on specified routes
export const config = {
    matcher: [
        // Protected routes
        '/account/:path*',
        '/checkout/:path*',
        // Auth routes
        '/auth/:path*',
    ],
}; 