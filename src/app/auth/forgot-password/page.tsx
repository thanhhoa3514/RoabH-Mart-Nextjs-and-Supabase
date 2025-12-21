'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

// interface AuthError {
//     message: string;
//     status?: number;
// }

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = await getSupabaseClient();
            // Use secure cookie-based auth with no URL parameters
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
                // Ensure token is handled securely via cookies, not URL parameters
            });

            if (error) {
                throw error;
            }

            // Successfully sent reset email
            setSuccess(true);
        } catch (err: unknown) {
            console.error('Password reset error:', err);
            // Type guard to ensure err has a message property
            const errorMessage = err && typeof err === 'object' && 'message' in err
                ? (err.message as string)
                : 'An error occurred. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h1 className="text-2xl font-bold text-center mb-6">Check Your Email</h1>
                        <p className="text-center mb-6">
                            We&apos;ve sent a password reset link to <strong>{email}</strong>.
                            Please check your inbox and follow the instructions to reset your password.
                        </p>
                        <div className="flex justify-center">
                            <Link
                                href="/auth/login"
                                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors"
                            >
                                Return to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-center mb-6">Forgot Your Password?</h1>
                    <p className="text-center text-gray-600 mb-6">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6">
                            {error}
                        </div>
                    )}

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

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary text-white py-3 rounded-md transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
                                }`}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link href="/auth/login" className="text-primary hover:underline">
                                Back to login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 