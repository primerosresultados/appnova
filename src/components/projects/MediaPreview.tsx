"use client";

import { ImageIcon, Video } from "lucide-react";

import Image from "next/image";
import { useState } from "react";

interface MediaPreviewProps {
    url: string | null;
    type?: string;
    className?: string;
}

export function MediaPreview({ url, type, className = "w-full h-full object-cover" }: MediaPreviewProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    if (!url) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted opacity-20">
                {type?.includes('VIDEO') || type?.includes('REEL') ? <Video className="h-12 w-12" /> : <ImageIcon className="h-12 w-12" />}
            </div>
        );
    }

    // Google Drive URL transformation
    const getDrivePreview = (driveUrl: string) => {
        const fileIdMatch = driveUrl.match(/\/file\/d\/([^\/]+)/) || driveUrl.match(/id=([^\&]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
            return `https://lh3.googleusercontent.com/u/0/d/${fileIdMatch[1]}=w1000`;
        }
        return driveUrl;
    };

    // YouTube URL transformation
    const getYouTubePreview = (youtubeUrl: string) => {
        const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
            return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
        }
        return null;
    };

    let previewUrl = imgSrc || url;
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isDrive = url.includes('drive.google.com');

    if (!imgSrc) {
        if (isDrive) {
            previewUrl = getDrivePreview(url);
        } else if (isYouTube) {
            const ytThumb = getYouTubePreview(url);
            if (ytThumb) previewUrl = ytThumb;
        }
    }

    // Check if the URL is valid for Next.js Image optimization (must be http/https)
    const isValidUrl = previewUrl.startsWith('http');

    return (
        <div className={`relative w-full h-full bg-muted overflow-hidden ${className}`}>
            {isValidUrl ? (
                <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    onError={() => {
                        // Fallback to placeholder if it's YouTube and maxresdefault failed
                        if (isYouTube && !imgSrc) {
                            setImgSrc("https://img.youtube.com/vi/placeholder/0.jpg");
                        }
                    }}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground p-4 text-center text-xs">
                    Preview not available
                </div>
            )}

            {isYouTube && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center text-foreground">
                        <Video className="h-6 w-6" />
                    </div>
                </div>
            )}
        </div>
    );
}
