import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client/client.model';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        // Chỉ chấp nhận form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Kiểm tra file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Giới hạn kích thước file (5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            );
        }

        // Chuyển đổi File thành ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Tạo tên file duy nhất
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `product-images/${fileName}`;

        // Upload file lên Supabase Storage
        const { error } = await supabase
            .storage
            .from('roabh-mart')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('Error uploading file:', error);
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        // Lấy public URL của file đã upload
        const { data: publicUrlData } = supabase
            .storage
            .from('roabh-mart')
            .getPublicUrl(filePath);

        return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            path: filePath
        });
    } catch (error) {
        console.error('Error in upload API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 