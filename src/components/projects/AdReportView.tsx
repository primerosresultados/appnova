'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Facebook, Chrome, TrendingUp, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CommentSection } from './CommentSection';
import { deleteAdReport } from '@/app/actions/ad-report-actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AdReportViewProps {
    report: {
        id: string;
        platform: string;
        startDate: Date;
        endDate: Date;
        title: string;
        reach?: number | null;
        impressions?: number | null;
        clicks?: number | null;
        spend?: number | null;
        conversions?: number | null;
        content?: string | null;
        createdBy?: {
            id: string;
            name: string;
            avatar?: string | null;
        } | null;
        createdAt: Date;
        comments?: any[];
    } | null;
    projectId: string;
    currentUser?: {
        id: string;
        name: string;
        avatar?: string | null;
    };
    onClose: () => void;
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

export function AdReportView({ report, projectId, currentUser, onClose }: AdReportViewProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!report) return null;

    const platform = platformConfig[report.platform as keyof typeof platformConfig] || platformConfig.OTHER;
    const PlatformIcon = platform.icon;
    const hasMetrics = report.reach || report.impressions || report.clicks || report.spend || report.conversions;

    const handleDelete = async () => {
        if (!confirm('¿Seguro que quieres eliminar este reporte? Esta acci&oacute;n no se puede deshacer.')) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteAdReport(report.id, projectId);
        setIsDeleting(false);

        if (result.success) {
            toast.success('Reporte eliminado');
            onClose();
            router.refresh();
        } else {
            toast.error(result.error || 'Error al eliminar');
        }
    };

    return (
        <Dialog open={!!report} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={platform.color}>
                                    <PlatformIcon className="h-3 w-3 mr-1" />
                                    {platform.label}
                                </Badge>
                            </div>
                            <DialogTitle className="text-2xl">{report.title}</DialogTitle>
                            <div className="text-sm text-muted-foreground mt-1">
                                {format(new Date(report.startDate), 'dd MMM yyyy', { locale: es })} -{' '}
                                {format(new Date(report.endDate), 'dd MMM yyyy', { locale: es })}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Metrics */}
                    {hasMetrics && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Métricas</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {report.reach !== null && report.reach !== undefined && (
                                    <div>
                                        <div className="text-xs text-muted-foreground">Alcance</div>
                                        <div className="text-2xl font-bold">{report.reach.toLocaleString()}</div>
                                    </div>
                                )}
                                {report.impressions !== null && report.impressions !== undefined && (
                                    <div>
                                        <div className="text-xs text-muted-foreground">Impresiones</div>
                                        <div className="text-2xl font-bold">{report.impressions.toLocaleString()}</div>
                                    </div>
                                )}
                                {report.clicks !== null && report.clicks !== undefined && (
                                    <div>
                                        <div className="text-xs text-muted-foreground">Clics</div>
                                        <div className="text-2xl font-bold">{report.clicks.toLocaleString()}</div>
                                    </div>
                                )}
                                {report.spend !== null && report.spend !== undefined && (
                                    <div>
                                        <div className="text-xs text-muted-foreground">Gasto</div>
                                        <div className="text-2xl font-bold">${report.spend.toFixed(2)}</div>
                                    </div>
                                )}
                                {report.conversions !== null && report.conversions !== undefined && (
                                    <div>
                                        <div className="text-xs text-muted-foreground">Conversiones</div>
                                        <div className="text-2xl font-bold">{report.conversions.toLocaleString()}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    {report.content && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Análisis</h3>
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: report.content }}
                            />
                        </div>
                    )}

                    {/* Meta */}
                    {report.createdBy && (
                        <div className="text-sm text-muted-foreground border-t pt-4">
                            Creado por {report.createdBy.name} el {format(new Date(report.createdAt), "dd 'de' MMMM 'a las' HH:mm", { locale: es })}
                        </div>
                    )}

                    {/* Comments */}
                    <div className="border-t pt-6">
                        <CommentSection
                            reportId={report.id}
                            comments={report.comments || []}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
