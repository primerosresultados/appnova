'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Facebook, Chrome, TrendingUp, MessageSquare, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdReportCardProps {
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
        selectedMetrics?: string[] | null; // ["reach", "spend", "ctr", "cpa"]
        blocks?: {
            id: string;
            title: string;
            description: string;
            images: string[];
        }[];
        createdBy?: {
            name: string;
            avatar?: string | null;
        } | null;
        createdAt: Date;
        comments?: any[];
    };
    projectId: string;
    onViewReport: (reportId: string) => void;
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

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}

export function AdReportCard({ report, projectId, onViewReport }: AdReportCardProps) {
    const platform = platformConfig[report.platform as keyof typeof platformConfig] || platformConfig.OTHER;
    const PlatformIcon = platform.icon;

    // Metric configuration
    const metricConfig: Record<string, { label: string; format: (val: any) => string }> = {
        reach: { label: 'Alcance', format: (v) => v?.toLocaleString('es-CL') || '0' },
        impressions: { label: 'Impresiones', format: (v) => v?.toLocaleString('es-CL') || '0' },
        clicks: { label: 'Clics', format: (v) => v?.toLocaleString('es-CL') || '0' },
        spend: { label: 'Gasto', format: (v) => v ? `$${Math.round(v).toLocaleString('es-CL')}` : '$0' },
        conversions: { label: 'Conversiones', format: (v) => v?.toLocaleString('es-CL') || '0' },
        ctr: { label: 'CTR', format: (v) => v ? `${v.toFixed(2)}%` : '0%' },
        cpc: { label: 'CPC', format: (v) => v ? `$${v.toLocaleString('es-CL')}` : '$0' },
        cpm: { label: 'CPM', format: (v) => v ? `$${v.toLocaleString('es-CL')}` : '$0' },
        cpa: { label: 'CPA', format: (v) => v ? `$${v.toLocaleString('es-CL')}` : '$0' },
        engagement: { label: 'Engagement', format: (v) => v?.toLocaleString('es-CL') || '0' },
        videoViews: { label: 'Video Views', format: (v) => v?.toLocaleString('es-CL') || '0' },
    };

    // Use selectedMetrics if available, otherwise fallback to showing all set metrics
    const metricsToShow = report.selectedMetrics && report.selectedMetrics.length > 0
        ? report.selectedMetrics
        : Object.keys(metricConfig).filter(key => (report as any)[key] !== null && (report as any)[key] !== undefined);

    // Get first block for preview
    const firstBlock = report.blocks && report.blocks.length > 0 ? report.blocks[0] : null;
    const blockPreview = firstBlock ? stripHtml(firstBlock.description).substring(0, 120) + '...' : null;

    return (
        <Card className="bg-card border-border/50 hover:border-border transition-colors cursor-pointer" onClick={() => onViewReport(report.id)}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={platform.color}>
                                <PlatformIcon className="h-3 w-3 mr-1" />
                                {platform.label}
                            </Badge>
                            {report.blocks && report.blocks.length > 0 && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {report.blocks.length} {report.blocks.length === 1 ? 'elemento' : 'elementos'}
                                </Badge>
                            )}
                        </div>
                        <h3 className="font-semibold">{report.title}</h3>
                        <div className="text-sm text-muted-foreground">
                            {format(new Date(report.startDate), 'dd MMM yyyy', { locale: es })} -{' '}
                            {format(new Date(report.endDate), 'dd MMM yyyy', { locale: es })}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {metricsToShow.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {metricsToShow.map(metricKey => {
                            const config = metricConfig[metricKey];
                            if (!config) return null;
                            const value = (report as any)[metricKey];
                            return (
                                <div key={metricKey}>
                                    <div className="text-xs text-muted-foreground">{config.label}</div>
                                    <div className="text-lg font-bold">{config.format(value)}</div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {firstBlock && (
                    <div className="border-t pt-3 space-y-1">
                        <p className="text-sm font-medium">{firstBlock.title}</p>
                        {blockPreview && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{blockPreview}</p>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <div>
                        {report.createdBy && (
                            <span>
                                Por {report.createdBy.name} • {format(new Date(report.createdAt), "dd MMM 'a las' HH:mm", { locale: es })}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {report.comments && report.comments.length > 0 && (
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{report.comments.length}</span>
                            </div>
                        )}
                        <Button variant="ghost" size="sm" className="h-7" onClick={(e) => { e.stopPropagation(); onViewReport(report.id); }}>
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Completo
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
