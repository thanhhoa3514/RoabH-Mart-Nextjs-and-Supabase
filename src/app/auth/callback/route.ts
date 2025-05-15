import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    console.log('Auth callback received:', {
        url: request.url,
        code: code ? 'Present' : 'Not present',
        searchParams: Object.fromEntries(requestUrl.searchParams.entries())
    });

    // Create a Supabase client with server-side cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Handle hash fragment tokens (after verification)
    // This handles redirects from email verification where tokens are in URL hash fragments
    if (requestUrl.hash && requestUrl.hash.includes('access_token')) {
        console.log('Access token found in URL hash, extracting and setting secure cookie');
        
        try {
            // The URL hash is not directly available server-side
            // but we know a token is present, so we can use getSession to check if it worked
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                console.log('Session found, user is verified and logged in');
                // Redirect to home page with session established in cookies
                // No need to extract token from hash - Supabase handles this internally
                return NextResponse.redirect(new URL('/', request.url));
            } else {
                console.log('No session found after hash-based verification');
                // Fall through to code-based verification
            }
        } catch (err) {
            console.error('Error handling hash fragment:', err);
        }
    }
    
    // Handle code parameter (email verification flow)
    if (code) {
        try {
            console.log('Exchanging code for session...');
            
            // Exchange the code for a session - THIS MUST BE AWAITED
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
                console.error('Error exchanging code for session:', error);
                return NextResponse.redirect(
                    new URL(`/auth/login?error=${encodeURIComponent('Verification failed. Please try again.')}`, request.url)
                );
            }
            
            console.log('Successfully exchanged code for session');
            
            // Check if we have a valid session
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                console.log('Session confirmed, user is verified and logged in');
                // Redirect to home page with verified=true parameter
                return NextResponse.redirect(new URL('/?verified=true', request.url));
            } else {
                console.log('Session not found after code exchange');
                // If no session, redirect to login page with verified flag
                return NextResponse.redirect(new URL('/auth/login?verified=true', request.url));
            }
        } catch (err) {
            console.error('Error during auth callback:', err);
            return NextResponse.redirect(
                new URL(`/auth/login?error=${encodeURIComponent('An error occurred during verification')}`, request.url)
            );
        }
    } else {
        console.warn('No code found in callback URL');
    }

    // Redirect to login page as fallback
    return NextResponse.redirect(new URL('/auth/login', request.url));
} 