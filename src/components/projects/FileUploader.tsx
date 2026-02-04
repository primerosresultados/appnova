'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, Loader2, FileText, File } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FileData {
    name: string;
    url: string;
    size: number;
    type: string;
}

interface FileUploaderProps {
    reportId?: string;
    files: FileData[];
    onChange: (files: FileData[]) => void;
    maxFiles?: number;
}

export function FileUploader({ reportId = 'temp', files, onChange, maxFiles = 3 }: FileUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        if (files.length + selectedFiles.length > maxFiles) {
            toast.error(`Máximo ${maxFiles} archivos permitidos`);
            return;
        }

        setUploading(true);

        try {
            const uploadPromises = Array.from(selectedFiles).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('reportId', reportId);
                formData.append('type', 'file');

                const response = await fetch('/api/upload/report-media', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Error al subir archivo');
                }

                const data = await response.json();
                return {
                    name: data.filename,
                    url: data.url,
                    size: data.size,
                    type: data.type,
                };
            });

            const uploadedFiles = await Promise.all(uploadPromises);
            onChange([...files, ...uploadedFiles]);
            toast.success(`${uploadedFiles.length} archivo(s) subido(s)`);
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Error al subir archivos');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return FileText;
        return File;
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.csv"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading || files.length >= maxFiles}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || files.length >= maxFiles}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                        </>
                    ) : (
                        <>
                            <Paperclip className="h-4 w-4 mr-2" />
                            Adjuntar Archivos
                        </>
                    )}
                </Button>
                <span className="text-xs text-muted-foreground">
                    {files.length}/{maxFiles}
                </span>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => {
                        const FileIcon = getFileIcon(file.type);
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group"
                            >
                                <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="p-1 hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
