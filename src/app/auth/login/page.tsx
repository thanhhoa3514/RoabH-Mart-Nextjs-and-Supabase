'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import Cookies from 'js-cookie';
import { useAlert } from '@/lib/context/alert-context';
import { useAuth } from '@/lib/auth/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const { showAlert } = useAlert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    // Check for redirect cookie on component mount
    useEffect(() => {
        // Get redirect path from cookie if it exists
        const path = Cookies.get('redirectPath');
        if (path) {
            setRedirectPath(path);
            // Remove the cookie after reading it
            Cookies.remove('redirectPath');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            
            if (error) {
                throw error;
            }

            // Show success alert
            showAlert('success', 'Login successful! Redirecting...', 2000);

            // Successfully logged in
            // Redirect to the stored path or default to account
            setTimeout(() => {
                router.push(redirectPath || '/account');
                router.refresh();
            }, 1000);
        } catch (err) {
            console.error('Login error:', err);
            showAlert('error', 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-center mb-6">Login to Your Account</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email Address
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
                            Don't have an account?{' '}
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