'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard after a brief delay
        const timeout = setTimeout(() => {
            router.push('/admin/dashboard');
        }, 1000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <h1 className="text-2xl font-bold text-amber-500">Loading Admin Dashboard...</h1>
            </motion.div>
        </div>
    );
} 