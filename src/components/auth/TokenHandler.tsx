'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAlert } from '@/lib/context/alert-context';

/**
 * This component handles authentication scenarios:
 * 1. Extracts tokens from URL hash fragments (token in URL after verification)
 * 2. Handles success/error URL parameters
 */
export default function TokenHandler() {
  const router = useRouter();
  const { showAlert } = useAlert();
  
  useEffect(() => {
    // Check for success parameters or hash fragments
    const handleAuthParams = async () => {
      // Handle URL hash fragments containing tokens
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const verified = params.get('verified');
      const error = params.get('error');
      
      // 1. Handle verification success parameter
      if (verified === 'true') {
        console.log('Verification success detected in URL parameters');
        showAlert('success', 'Xác minh email thành công!', 5000);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      // 2. Handle error parameter
      if (error) {
        console.log('Error parameter detected in URL:', error);
        const errorMessage = decodeURIComponent(error);
        showAlert('error', errorMessage, 8000);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      // 3. Handle hash fragments with tokens
      if (hash && hash.includes('access_token')) {
        console.log('TokenHandler: Found access_token in URL hash');
        
        try {
          // Force supabase to process the hash
          await supabase.auth.getSession();
          
          // Get the session that should now be established
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session from hash:', error);
            showAlert('error', 'Không thể đăng nhập với token được cung cấp.', 5000);
            return;
          }
          
          if (data.session) {
            console.log('Successfully established session from hash token');
            showAlert('success', 'Đăng nhập thành công!', 3000);
            
            // Clean URL and redirect to home page
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Short delay to ensure token is properly stored
            setTimeout(() => {
              router.push('/');
              router.refresh();
            }, 500);
          } else {
            console.warn('No session established despite having access token in URL');
            showAlert('error', 'Phiên không được thiết lập. Vui lòng thử đăng nhập lại.', 5000);
          }
        } catch (err) {
          console.error('Error handling token in hash:', err);
          showAlert('error', 'Đã xảy ra lỗi khi xử lý token xác thực.', 5000);
        }
      }
    };
    
    handleAuthParams();
  }, [router, showAlert]);
  
  useEffect(() => {
    // Lấy hash URL để kiểm tra token
    const handleHashChange = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        console.log('Found auth tokens in URL hash, attempting to set session');
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
          } else {
            console.log('Session successfully set from URL hash tokens');
            // Xoá hash từ URL để bảo mật
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            // Tải lại trang để áp dụng phiên mới
            router.refresh();
          }
        } catch (err) {
          console.error('Unexpected error handling tokens:', err);
        }
      }
    };

    // Chạy ngay khi component mount
    handleHashChange();

    // Thêm listener cho hashchange (trong trường hợp SPA navigation)
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [router]);
  
  // This component doesn't render anything visible
  return null;
} 