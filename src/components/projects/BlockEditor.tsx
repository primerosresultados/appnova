'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUploader } from './ImageUploader';
import { FileUploader } from './FileUploader';
import { Trash2, GripVertical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface ReportBlock {
    id: string;
    title: string;
    description: string;
    images: string[];
    files: { name: string; url: string; size: number; type: string }[];
}

interface BlockEditorProps {
    block: ReportBlock;
    index: number;
    reportId?: string;
    onChange: (block: ReportBlock) => void;
    onRemove: () => void;
    isFirst: boolean;
}

export function BlockEditor({ block, index, reportId, onChange, onRemove, isFirst }: BlockEditorProps) {
    const updateField = (field: keyof ReportBlock, value: any) => {
        onChange({ ...block, [field]: value });
    };

    return (
        <Card className="relative">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <div className="flex-1">
                            <Label>Título del Elemento {index + 1}</Label>
                            <Input
                                placeholder="Ej: ESTADO DE LA CUENTA: PAUSA POR FALTA DE PAGO"
                                value={block.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                className="mt-1"
                                required
                            />
                        </div>
                    </div>
                    {!isFirst && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onRemove}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Rich Text Description */}
                <div className="space-y-2">
                    <Label>Descripción</Label>
                    <RichTextEditor
                        value={block.description}
                        onChange={(value) => updateField('description', value)}
                        placeholder="Describe los detalles de este elemento... Usa formato para organizar la información."
                        className="min-h-[200px]"
                    />
                </div>

                <Separator />

                {/* Image Uploader */}
                <div className="space-y-2">
                    <Label className="text-sm">Imágenes (Opcional)</Label>
                    <ImageUploader
                        reportId={reportId}
                        images={block.images}
                        onChange={(images) => updateField('images', images)}
                        maxImages={5}
                    />
                </div>

                {/* File Uploader */}
                <div className="space-y-2">
                    <Label className="text-sm">Archivos Adjuntos (Opcional)</Label>
                    <FileUploader
                        reportId={reportId}
                        files={block.files}
                        onChange={(files) => updateField('files', files)}
                        maxFiles={3}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
