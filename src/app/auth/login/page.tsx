'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, CheckCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { useAlert } from '@/lib/context/alert-context';
import { useAuth } from '@/lib/auth/AuthContext';
import TokenHandler from '@/components/auth/TokenHandler';


// interface AuthError {
//     message: string;
//     status?: number;
// }

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn } = useAuth();
    const { showAlert } = useAlert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);
    const [justVerified, setJustVerified] = useState(false);

    // Check for redirect cookie and URL parameters on component mount
    useEffect(() => {
        // Get redirect path from cookie if it exists
        const path = Cookies.get('redirectPath');
        if (path) {
            setRedirectPath(path);
            // Remove the cookie after reading it
            Cookies.remove('redirectPath');
        }

        // Check for verification status in URL
        const verified = searchParams.get('verified');
        const error = searchParams.get('error');

        if (verified === 'true') {
            setJustVerified(true);
            showAlert('success', 'Xác minh email thành công! Bạn có thể đăng nhập ngay bây giờ.', 8000);
            
            // Log for debugging
            console.log('Email verification successful, user can now login');
        } else if (error) {
            showAlert('error', decodeURIComponent(error), 8000);
            console.error('Auth error:', decodeURIComponent(error));
        }
    }, [searchParams, showAlert]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        console.log('Login attempt starting for email:', email);

        try {
            console.log('Calling signIn method...');
            const { error } = await signIn(email, password);
            
            if (error) {
                console.error('Login error details:', error);
                throw error;
            }

            // Show success alert
            console.log('Login successful, preparing to redirect...');
            showAlert('success', 'Login successful! Redirecting...', 2000);

            // Successfully logged in
            // Redirect to the stored path or default to account
            setTimeout(() => {
                console.log('Redirecting to:', redirectPath || '/');
                router.push(redirectPath || '/');
                router.refresh();
            }, 1000);
        } catch (err: unknown) {
            console.error('Login error:', err);
            const errorMessage = err && typeof err === 'object' && 'message' in err 
                ? (err.message as string) 
                : 'Invalid email or password. Please try again.';
            showAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <TokenHandler />
     
            
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-center mb-6">Đăng Nhập</h1>

                    {justVerified && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                            <p>Email đã được xác minh! Bạn có thể đăng nhập ngay bây giờ.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary text-white py-3 rounded-md transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
                                }`}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/register" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 