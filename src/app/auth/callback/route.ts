import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    // const requestUrl = new URL(request.url);
    
    // Middleware đã xử lý session exchange, bây giờ chuyển hướng người dùng đến trang đăng nhập 
    // với tham số verified=true để hiển thị thông báo thành công
    return NextResponse.redirect(new URL('/auth/login?verified=true', request.url));
} 