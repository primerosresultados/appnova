'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Facebook, Chrome, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { deleteAdReport } from '@/app/actions/ad-report-actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AdReportCardProps {
    report: {
        id: string;
        platform: string;
        startDate: Date;
        endDate: Date;
        title?: string | null;
        reach?: number | null;
        impressions?: number | null;
        clicks?: number | null;
        spend?: number | null;
        conversions?: number | null;
        keyConsiderations?: string | null;
        createdBy?: {
            name: string;
            avatar?: string | null;
        } | null;
        createdAt: Date;
    };
    projectId: string;
}

const platformConfig = {
    META_ADS: {
        label: 'Meta Ads',
        icon: Facebook,
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    GOOGLE_ADS: {
        label: 'Google Ads',
        icon: Chrome,
        color: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    OTHER: {
        label: 'Otro',
        icon: TrendingUp,
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
};

export function AdReportCard({ report, projectId }: AdReportCardProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const platform = platformConfig[report.platform as keyof typeof platformConfig] || platformConfig.OTHER;
    const PlatformIcon = platform.icon;

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteAdReport(report.id, projectId);
        setIsDeleting(false);

        if (result.success) {
            toast.success('Reporte eliminado');
            setShowDeleteDialog(false);
            router.refresh();
        } else {
            toast.error(result.error || 'Error al eliminar');
        }
    };

    // Check if there are any metrics to display
    const hasMetrics = report.reach || report.impressions || report.clicks || report.spend || report.conversions;

    return (
        <>
            <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={platform.color}>
                                    <PlatformIcon className="h-3 w-3 mr-1" />
                                    {platform.label}
                                </Badge>
                                {report.title && (
                                    <span className="font-medium">{report.title}</span>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {format(new Date(report.startDate), 'dd MMM yyyy', { locale: es })} -{' '}
                                {format(new Date(report.endDate), 'dd MMM yyyy', { locale: es })}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {hasMetrics && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {report.reach !== null && report.reach !== undefined && (
                                <div>
                                    <div className="text-xs text-muted-foreground">Alcance</div>
                                    <div className="text-lg font-bold">{report.reach.toLocaleString()}</div>
                                </div>
                            )}
                            {report.impressions !== null && report.impressions !== undefined && (
                                <div>
                                    <div className="text-xs text-muted-foreground">Impresiones</div>
                                    <div className="text-lg font-bold">{report.impressions.toLocaleString()}</div>
                                </div>
                            )}
                            {report.clicks !== null && report.clicks !== undefined && (
                                <div>
                                    <div className="text-xs text-muted-foreground">Clics</div>
                                    <div className="text-lg font-bold">{report.clicks.toLocaleString()}</div>
                                </div>
                            )}
                            {report.spend !== null && report.spend !== undefined && (
                                <div>
                                    <div className="text-xs text-muted-foreground">Gasto</div>
                                    <div className="text-lg font-bold">${report.spend.toFixed(2)}</div>
                                </div>
                            )}
                            {report.conversions !== null && report.conversions !== undefined && (
                                <div>
                                    <div className="text-xs text-muted-foreground">Conversiones</div>
                                    <div className="text-lg font-bold">{report.conversions.toLocaleString()}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {report.keyConsiderations && (
                        <div className="border-t pt-3">
                            <div className="text-xs text-muted-foreground mb-2">Consideraciones Clave</div>
                            <div className="text-sm whitespace-pre-wrap">{report.keyConsiderations}</div>
                        </div>
                    )}

                    {report.createdBy && (
                        <div className="text-xs text-muted-foreground">
                            Por {report.createdBy.name} • {format(new Date(report.createdAt), "dd MMM 'a las' HH:mm", { locale: es })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar reporte?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El reporte será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
