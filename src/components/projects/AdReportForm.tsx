'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    const [keyConsiderations, setKeyConsiderations] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            toast.error('Debes seleccionar un rango de fechas');
            return;
        }

        setIsSubmitting(true);

        const result = await createAdReport({
            projectId,
            platform,
            startDate,
            endDate,
            title: title || undefined,
            reach: reach ? parseInt(reach) : undefined,
            impressions: impressions ? parseInt(impressions) : undefined,
            clicks: clicks ? parseInt(clicks) : undefined,
            spend: spend ? parseFloat(spend) : undefined,
            conversions: conversions ? parseInt(conversions) : undefined,
            keyConsiderations: keyConsiderations || undefined,
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
        setKeyConsiderations('');
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Reporte
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <SheetHeader>
                        <SheetTitle>Nuevo Reporte de Campaña</SheetTitle>
                        <SheetDescription>
                            Anota manualmente los resultados de tus campañas publicitarias
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 py-6">
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
                            <Label>Título (Opcional)</Label>
                            <Input
                                placeholder="Ej: Campaña Navidad 2024"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
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

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3">Métricas (Opcionales)</h4>
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

                        <div className="space-y-2">
                            <Label>Consideraciones Clave</Label>
                            <Textarea
                                placeholder="Notas, insights, aprendizajes de la campaña..."
                                value={keyConsiderations}
                                onChange={(e) => setKeyConsiderations(e.target.value)}
                                rows={4}
                            />
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
