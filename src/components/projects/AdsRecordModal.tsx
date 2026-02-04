'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface AdsRecordItem {
    id: string;
    title: string;
    description: string;
}

interface AdsRecordModalProps {
    projectId: string;
    onSave: (items: AdsRecordItem[]) => Promise<void>;
}

export function AdsRecordModal({ projectId, onSave }: AdsRecordModalProps) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<AdsRecordItem[]>([
        { id: uuidv4(), title: '', description: '' }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const addItem = () => {
        setItems([...items, { id: uuidv4(), title: '', description: '' }]);
    };

    const removeItem = (id: string) => {
        if (items.length === 1) {
            toast.error('Debe haber al menos un item');
            return;
        }
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: 'title' | 'description', value: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSave = async () => {
        // Validate
        const hasContent = items.some(item => item.title.trim() || item.description.trim());
        if (!hasContent) {
            toast.error('Agrega al menos un item con título o descripción');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(items.filter(item => item.title.trim() || item.description.trim()));
            toast.success('Registros de Ads guardados correctamente');
            setOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setItems([{ id: uuidv4(), title: '', description: '' }]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" /> Nuevo Recurso
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Registros de Ads
                    </DialogTitle>
                    <DialogDescription>
                        Agrega información relevante sobre campañas publicitarias
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {items.map((item, index) => (
                        <Card key={item.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="space-y-2">
                                            <Label>Título del Item {index + 1}</Label>
                                            <Input
                                                placeholder="Ej: Campaña Meta Ads - Enero"
                                                value={item.title}
                                                onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.id)}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea
                                        placeholder="Describe los detalles, métricas, insights..."
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addItem}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Otro Item
                    </Button>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar Todos'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
