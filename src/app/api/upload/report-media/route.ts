import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
];

const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/csv',
];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const reportId = formData.get('reportId') as string;
        const type = formData.get('type') as 'image' | 'file';

        if (!file || !reportId || !type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type: ${file.type}` },
                { status: 400 }
            );
        }

        // Validate file size
        const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        // Create upload directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'reports', reportId);
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filename = `${timestamp}_${originalName}`;
        const filepath = join(uploadsDir, filename);

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Return public URL
        const url = `/uploads/reports/${reportId}/${filename}`;

        return NextResponse.json({
            success: true,
            url,
            filename: file.name,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
