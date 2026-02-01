"use client";

import { ImageIcon, Video } from "lucide-react";

interface MediaPreviewProps {
    url: string | null;
    type?: string;
    className?: string;
}

export function MediaPreview({ url, type, className = "w-full h-full object-cover" }: MediaPreviewProps) {
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

    let previewUrl = url;
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isDrive = url.includes('drive.google.com');

    if (isDrive) {
        previewUrl = getDrivePreview(url);
    } else if (isYouTube) {
        const ytThumb = getYouTubePreview(url);
        if (ytThumb) previewUrl = ytThumb;
    }

    return (
        <div className="relative w-full h-full bg-muted overflow-hidden">
            <img
                src={previewUrl}
                alt="Preview"
                className={className}
                onError={(e) => {
                    // Fallback to original if drive transform fails or show icon
                    if (isYouTube) {
                        e.currentTarget.src = "https://img.youtube.com/vi/placeholder/0.jpg";
                    }
                }}
            />
            {isYouTube && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center text-foreground">
                        <Video className="h-6 w-6" />
                    </div>
                </div>
            )}
        </div>
    );
}
