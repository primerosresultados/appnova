'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface ImageUploaderProps {
    reportId?: string;
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
}

export function ImageUploader({ reportId = 'temp', images, onChange, maxImages = 5 }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > maxImages) {
            toast.error(`Máximo ${maxImages} imágenes permitidas`);
            return;
        }

        setUploading(true);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('reportId', reportId);
                formData.append('type', 'image');

                const response = await fetch('/api/upload/report-media', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Error al subir imagen');
                }

                const data = await response.json();
                return data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            onChange([...images, ...uploadedUrls]);
            toast.success(`${uploadedUrls.length} imagen(es) subida(s)`);
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Error al subir imágenes');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading || images.length >= maxImages}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || images.length >= maxImages}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                        </>
                    ) : (
                        <>
                            <ImagePlus className="h-4 w-4 mr-2" />
                            Agregar Imágenes
                        </>
                    )}
                </Button>
                <span className="text-xs text-muted-foreground">
                    {images.length}/{maxImages}
                </span>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((url, index) => (
                        <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border bg-muted">
                            <Image
                                src={url}
                                alt={`Imagen ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
