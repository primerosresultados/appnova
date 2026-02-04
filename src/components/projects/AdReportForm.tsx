'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createAdReport, updateAdReport } from '@/app/actions/ad-report-actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { BlockEditor, ReportBlock } from './BlockEditor';
import { v4 as uuidv4 } from 'uuid';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

interface AdReportFormProps {
    projectId: string;
    currentUserId?: string;
    initialData?: {
        id: string;
        platform: string;
        title: string;
        startDate: Date;
        endDate: Date;
        selectedMetrics?: any[]; // Allow any for now to map from JSON/DB
        reach?: number | null;
        impressions?: number | null;
        clicks?: number | null;
        spend?: number | null;
        conversions?: number | null;
        blocks?: any[];
    } | null;
    onSuccess?: () => void;
    open?: boolean; // Controlled open state
    onOpenChange?: (open: boolean) => void; // Controlled open change handler
}

export function AdReportForm({ projectId, currentUserId, initialData, onSuccess, open: controlledOpen, onOpenChange }: AdReportFormProps) {
    const router = useRouter();
    // Use controlled state if provided, otherwise local state
    const [internalOpen, setInternalOpen] = useState(false);

    // Determine which state to use
    const isControlled = typeof controlledOpen !== 'undefined';
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const setIsOpen = isControlled && onOpenChange ? onOpenChange : setInternalOpen;

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [platform, setPlatform] = useState<'META_ADS' | 'GOOGLE_ADS' | 'OTHER'>('META_ADS');
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    // Dynamic metrics state
    const [selectedMetrics, setSelectedMetrics] = useState<
        { key: string; label: string; value: string; type: 'number' | 'currency' | 'percentage'; description: string }[]
    >([]);

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

    // Load initial data if provided
    useEffect(() => {
        if (initialData) {
            setPlatform(initialData.platform as 'META_ADS' | 'GOOGLE_ADS' | 'OTHER');
            setTitle(initialData.title);
            setStartDate(new Date(initialData.startDate));
            setEndDate(new Date(initialData.endDate));

            // Map blocks
            if (initialData.blocks && initialData.blocks.length > 0) {
                setBlocks(initialData.blocks.map((b: any) => ({
                    id: b.id || uuidv4(),
                    title: b.title,
                    description: b.description,
                    images: b.images || [],
                    files: b.files || [],
                })));
            }

            // Map metrics
            const loadedMetrics: typeof selectedMetrics = [];
            const availableMetrics = [
                { key: 'reach', label: 'Alcance', type: 'number' as const, description: 'Personas alcanzadas' },
                { key: 'impressions', label: 'Impresiones', type: 'number' as const, description: 'Veces que se mostró el anuncio' },
                { key: 'clicks', label: 'Clics', type: 'number' as const, description: 'Clics en el anuncio' },
                { key: 'spend', label: 'Gasto', type: 'currency' as const, description: 'Inversión total' },
                { key: 'conversions', label: 'Conversiones', type: 'number' as const, description: 'Oportunidades de venta generadas' },
                // Add others if needed
            ];

            // Check standard metrics fields
            if (initialData.reach) loadedMetrics.push({ ...availableMetrics.find(m => m.key === 'reach')!, value: initialData.reach.toString() });
            if (initialData.impressions) loadedMetrics.push({ ...availableMetrics.find(m => m.key === 'impressions')!, value: initialData.impressions.toString() });
            if (initialData.clicks) loadedMetrics.push({ ...availableMetrics.find(m => m.key === 'clicks')!, value: initialData.clicks.toString() });
            if (initialData.spend) loadedMetrics.push({ ...availableMetrics.find(m => m.key === 'spend')!, value: initialData.spend.toString() });
            if (initialData.conversions) loadedMetrics.push({ ...availableMetrics.find(m => m.key === 'conversions')!, value: initialData.conversions.toString() });

            // Ensure unique
            const uniqueMetrics = loadedMetrics.filter((v, i, a) => a.findIndex(t => t.key === v.key) === i);
            setSelectedMetrics(uniqueMetrics);
        } else {
            // Reset form if initialData is null (for create mode)
            // We can optionally reset here or when dialog opens/closes
        }
    }, [initialData]);

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

        // Map selected metrics
        const metricsData: any = {};
        selectedMetrics.forEach(metric => {
            if (metric.value) {
                const numValue = metric.type === 'currency' || metric.type === 'percentage'
                    ? parseFloat(metric.value)
                    : parseInt(metric.value);
                metricsData[metric.key] = numValue;
            }
        });

        let result;

        if (initialData?.id) {
            // Update mode
            result = await updateAdReport(initialData.id, {
                platform,
                startDate,
                endDate,
                title,
                ...metricsData, // Spread dynamic metrics
                selectedMetrics: selectedMetrics.map(m => m.key),
                blocks: blocks.filter(b => b.title.trim() || b.description.trim()),
            });
        } else {
            // Create mode
            result = await createAdReport({
                projectId,
                platform,
                startDate,
                endDate,
                title,
                ...metricsData, // Spread dynamic metrics
                selectedMetrics: selectedMetrics.map(m => m.key), // Save metric keys
                blocks: blocks.filter(b => b.title.trim() || b.description.trim()),
                createdById: currentUserId,
            });
        }

        setIsSubmitting(false);

        if (result.success) {
            toast.success(initialData ? 'Reporte actualizado' : 'Reporte creado');
            setIsOpen(false);
            if (!initialData) resetForm(); // Only reset on create
            if (onSuccess) onSuccess();
            router.refresh();
        } else {
            toast.error(result.error || 'Error al guardar reporte');
        }
    };

    const resetForm = () => {
        setPlatform('META_ADS');
        setTitle('');
        setStartDate(undefined);
        setEndDate(undefined);
        setSelectedMetrics([]);
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Reporte
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{initialData ? 'Editar Reporte' : 'Nuevo Reporte de Campaña'}</DialogTitle>
                        <DialogDescription>
                            Documenta análisis detallados con múltiples elementos organizados
                        </DialogDescription>
                    </DialogHeader>

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

                        {/* Dynamic Metrics */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Métricas (Opcionales)</h4>
                                <span className="text-xs text-muted-foreground">{selectedMetrics.length}/4</span>
                            </div>

                            {/* Selected Metrics */}
                            {selectedMetrics.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedMetrics.map((metric, index) => (
                                        <Card key={metric.key} className="p-3">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <Label className="text-sm font-medium">{metric.label}</Label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => {
                                                        setSelectedMetrics(selectedMetrics.filter((_, i) => i !== index));
                                                    }}
                                                >
                                                    <Plus className="h-3 w-3 rotate-45" />
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mb-2">{metric.description}</p>
                                            <Input
                                                type="number"
                                                step={metric.type === 'currency' || metric.type === 'percentage' ? "0.01" : "1"}
                                                placeholder={
                                                    metric.type === 'currency' ? '$0.00' :
                                                        metric.type === 'percentage' ? '0.00%' :
                                                            '0'
                                                }
                                                value={metric.value}
                                                onChange={(e) => {
                                                    const newMetrics = [...selectedMetrics];
                                                    newMetrics[index].value = e.target.value;
                                                    setSelectedMetrics(newMetrics);
                                                }}
                                            />
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Add Metric Button */}
                            {selectedMetrics.length < 4 && (
                                <Select
                                    value=""
                                    onValueChange={(value) => {
                                        const availableMetrics = [
                                            { key: 'reach', label: 'Alcance', type: 'number' as const, description: 'Personas alcanzadas' },
                                            { key: 'impressions', label: 'Impresiones', type: 'number' as const, description: 'Veces que se mostró el anuncio' },
                                            { key: 'clicks', label: 'Clics', type: 'number' as const, description: 'Clics en el anuncio' },
                                            { key: 'spend', label: 'Gasto', type: 'currency' as const, description: 'Inversión total' },
                                            { key: 'conversions', label: 'Conversiones', type: 'number' as const, description: 'Oportunidades de venta generadas' },
                                            { key: 'ctr', label: 'CTR', type: 'percentage' as const, description: '% de personas que hicieron clic' },
                                            { key: 'cpc', label: 'CPC', type: 'currency' as const, description: 'Costo promedio por clic' },
                                            { key: 'cpm', label: 'CPM', type: 'currency' as const, description: 'Costo por mil impresiones' },
                                            { key: 'cpa', label: 'CPA', type: 'currency' as const, description: 'Costo por conversión' },
                                            { key: 'engagement', label: 'Engagement', type: 'number' as const, description: 'Interacciones totales' },
                                            { key: 'videoViews', label: 'Video Views', type: 'number' as const, description: 'Reproducciones de video' },
                                        ];

                                        const metric = availableMetrics.find(m => m.key === value);
                                        if (metric && !selectedMetrics.find(m => m.key === metric.key)) {
                                            setSelectedMetrics([...selectedMetrics, { ...metric, value: '' }]);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Agregar Métrica" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            { key: 'reach', label: 'Alcance' },
                                            { key: 'impressions', label: 'Impresiones' },
                                            { key: 'clicks', label: 'Clics' },
                                            { key: 'spend', label: 'Gasto ($)' },
                                            { key: 'conversions', label: 'Conversiones' },
                                            { key: 'ctr', label: 'CTR (%)' },
                                            { key: 'cpc', label: 'CPC ($)' },
                                            { key: 'cpm', label: 'CPM ($)' },
                                            { key: 'cpa', label: 'CPA ($)' },
                                            { key: 'engagement', label: 'Engagement' },
                                            { key: 'videoViews', label: 'Video Views' },
                                        ]
                                            .filter(m => !selectedMetrics.find(sm => sm.key === m.key))
                                            .map(metric => (
                                                <SelectItem key={metric.key} value={metric.key}>
                                                    {metric.label}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
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

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Crear Reporte'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
