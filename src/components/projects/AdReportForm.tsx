'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createAdReport } from '@/app/actions/ad-report-actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { BlockEditor, ReportBlock } from './BlockEditor';
import { v4 as uuidv4 } from 'uuid';
import { Separator } from '@/components/ui/separator';

interface AdReportFormProps {
    projectId: string;
    currentUserId?: string;
}

export function AdReportForm({ projectId, currentUserId }: AdReportFormProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [platform, setPlatform] = useState<'META_ADS' | 'GOOGLE_ADS' | 'OTHER'>('META_ADS');
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [reach, setReach] = useState('');
    const [impressions, setImpressions] = useState('');
    const [clicks, setClicks] = useState('');
    const [spend, setSpend] = useState('');
    const [conversions, setConversions] = useState('');

    // Blocks state
    const [blocks, setBlocks] = useState<ReportBlock[]>([
        {
            id: uuidv4(),
            title: '',
            description: '',
            images: [],
            files: [],
        },
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('El título es obligatorio');
            return;
        }

        if (!startDate || !endDate) {
            toast.error('Debes seleccionar un rango de fechas');
            return;
        }

        // Validate at least one block has content
        const hasContent = blocks.some(b => b.title.trim() || b.description.trim());
        if (!hasContent) {
            toast.error('Agrega al menos un elemento con título o descripción');
            return;
        }

        setIsSubmitting(true);

        const result = await createAdReport({
            projectId,
            platform,
            startDate,
            endDate,
            title,
            reach: reach ? parseInt(reach) : undefined,
            impressions: impressions ? parseInt(impressions) : undefined,
            clicks: clicks ? parseInt(clicks) : undefined,
            spend: spend ? parseFloat(spend) : undefined,
            conversions: conversions ? parseInt(conversions) : undefined,
            blocks: blocks.filter(b => b.title.trim() || b.description.trim()), // Only save non-empty blocks
            createdById: currentUserId,
        });

        setIsSubmitting(false);

        if (result.success) {
            toast.success('Reporte creado exitosamente');
            setOpen(false);
            resetForm();
            router.refresh();
        } else {
            toast.error(result.error || 'Error al crear reporte');
        }
    };

    const resetForm = () => {
        setPlatform('META_ADS');
        setTitle('');
        setStartDate(undefined);
        setEndDate(undefined);
        setReach('');
        setImpressions('');
        setClicks('');
        setSpend('');
        setConversions('');
        setBlocks([{
            id: uuidv4(),
            title: '',
            description: '',
            images: [],
            files: [],
        }]);
    };

    const addBlock = () => {
        setBlocks([...blocks, {
            id: uuidv4(),
            title: '',
            description: '',
            images: [],
            files: [],
        }]);
    };

    const updateBlock = (index: number, updatedBlock: ReportBlock) => {
        const newBlocks = [...blocks];
        newBlocks[index] = updatedBlock;
        setBlocks(newBlocks);
    };

    const removeBlock = (index: number) => {
        if (blocks.length === 1) {
            toast.error('Debe haber al menos un elemento');
            return;
        }
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Reporte
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <SheetHeader>
                        <SheetTitle>Nuevo Reporte de Campaña</SheetTitle>
                        <SheetDescription>
                            Documenta análisis detallados con múltiples elementos organizados
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6 py-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Información General</h4>

                            <div className="space-y-2">
                                <Label>Plataforma</Label>
                                <Select
                                    value={platform}
                                    onValueChange={(value) => setPlatform(value as typeof platform)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="META_ADS">Meta Ads (Facebook/Instagram)</SelectItem>
                                        <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
                                        <SelectItem value="OTHER">Otra Plataforma</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Título del Reporte *</Label>
                                <Input
                                    placeholder="Ej: Análisis Meta Ads - Enero 2026"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha Inicio *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, 'PPP', { locale: es }) : 'Seleccionar'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>Fecha Fin *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, 'PPP', { locale: es }) : 'Seleccionar'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                initialFocus
                                                disabled={(date) => startDate ? date < startDate : false}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Metrics */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Métricas (Opcionales)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Alcance</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={reach}
                                        onChange={(e) => setReach(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Impresiones</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={impressions}
                                        onChange={(e) => setImpressions(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Clics</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={clicks}
                                        onChange={(e) => setClicks(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Gasto</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={spend}
                                        onChange={(e) => setSpend(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Conversiones</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={conversions}
                                        onChange={(e) => setConversions(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Content Blocks */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Elementos del Reporte</h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addBlock}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Añadir Elemento
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {blocks.map((block, index) => (
                                    <BlockEditor
                                        key={block.id}
                                        block={block}
                                        index={index}
                                        reportId={projectId}
                                        onChange={(updatedBlock) => updateBlock(index, updatedBlock)}
                                        onRemove={() => removeBlock(index)}
                                        isFirst={index === 0}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <SheetFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Crear Reporte'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
