'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SessionDebugger() {
    const [sessionInfo, setSessionInfo] = useState<{
        hasSession: boolean;
        expires: string | null;
        user: string | null;
        tokenError: string | null;
    }>({
        hasSession: false,
        expires: null,
        user: null,
        tokenError: null
    });

    const [loading, setLoading] = useState(true);

    // Kiểm tra session khi component được tải
    useEffect(() => {
        async function checkSession() {
            try {
                const { data, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error("Error getting session:", error);
                    setSessionInfo({
                        hasSession: false,
                        expires: null,
                        user: null,
                        tokenError: error.message
                    });
                } else {
                    setSessionInfo({
                        hasSession: !!data.session,
                        expires: data.session?.expires_at 
                            ? new Date(data.session.expires_at * 1000).toLocaleString() 
                            : null,
                        user: data.session?.user?.email || null,
                        tokenError: null
                    });
                }
            } catch (err) {
                console.error("Unexpected error:", err);
                setSessionInfo({
                    hasSession: false,
                    expires: null,
                    user: null,
                    tokenError: err instanceof Error ? err.message : String(err)
                });
            } finally {
                setLoading(false);
            }
        }

        checkSession();
    }, []);

    // Kiểm tra lại session theo cách thủ công
    const refreshSession = async () => {
        setLoading(true);
        await supabase.auth.refreshSession();
        const { data } = await supabase.auth.getSession();
        setSessionInfo({
            hasSession: !!data.session,
            expires: data.session?.expires_at 
                ? new Date(data.session.expires_at * 1000).toLocaleString() 
                : null,
            user: data.session?.user?.email || null,
            tokenError: null
        });
        setLoading(false);
    };

    // Kiểm tra localStorage để xem token
    const [storageInfo, setStorageInfo] = useState<{
        hasAuthStorage: boolean;
        cookieExists: boolean;
        cookieName: string | null;
    }>({
        hasAuthStorage: false,
        cookieExists: false,
        cookieName: null
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Kiểm tra localStorage
            const hasAuthStorage = localStorage.getItem('supabase-auth-storage') !== null;
            
            // Kiểm tra tất cả cookies để tìm cookie Supabase auth
            const allCookies = document.cookie.split(';');
            let cookieExists = false;
            let cookieName = null;
            
            allCookies.forEach(cookie => {
                const trimmedCookie = cookie.trim();
                if (trimmedCookie.startsWith('sb-')) {
                    cookieExists = true;
                    cookieName = trimmedCookie.split('=')[0];
                }
            });
            
            setStorageInfo({ 
                hasAuthStorage, 
                cookieExists,
                cookieName
            });
        }
    }, []);

    return (
        <div className="p-4 mb-8 border border-gray-300 rounded bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">Debug thông tin phiên đăng nhập</h2>
            
            {loading ? (
                <p>Đang kiểm tra phiên đăng nhập...</p>
            ) : (
                <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Đã đăng nhập:</span> {sessionInfo.hasSession ? '✅ Có' : '❌ Không'}</div>
                    {sessionInfo.user && <div><span className="font-medium">Email:</span> {sessionInfo.user}</div>}
                    {sessionInfo.expires && <div><span className="font-medium">Hết hạn:</span> {sessionInfo.expires}</div>}
                    {sessionInfo.tokenError && <div className="text-red-500"><span className="font-medium">Lỗi:</span> {sessionInfo.tokenError}</div>}
                    <div><span className="font-medium">Auth Storage trong localStorage:</span> {storageInfo.hasAuthStorage ? '✅ Có' : '❌ Không'}</div>
                    {storageInfo.cookieExists && <div><span className="font-medium">Cookie Name:</span> {storageInfo.cookieName}</div>}
                    
                    <button 
                        onClick={refreshSession}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                        Làm mới phiên
                    </button>
                </div>
            )}
        </div>
    );
} 