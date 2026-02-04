'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Facebook, Chrome, TrendingUp, MessageSquare, Eye } from 'lucide-react';
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
        content?: string | null;
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

    // Check if there are any metrics to display
    const hasMetrics = report.reach || report.impressions || report.clicks || report.spend || report.conversions;

    // Create preview of content
    const contentPreview = report.content ? stripHtml(report.content).substring(0, 150) + '...' : null;

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
                            <h3 className="font-semibold">{report.title}</h3>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {format(new Date(report.startDate), 'dd MMM yyyy', { locale: es })} -{' '}
                            {format(new Date(report.endDate), 'dd MMM yyyy', { locale: es })}
                        </div>
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

                {contentPreview && (
                    <div className="border-t pt-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{contentPreview}</p>
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
