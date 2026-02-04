'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MetaAdsInsights } from './MetaAdsInsights';
import { AdReportForm } from './AdReportForm';
import { AdReportCard } from './AdReportCard';
import { AdReportView } from './AdReportView';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdsTabProps {
    projectId: string;
    metaAdAccountId: string | null;
    adReports: any[];
    currentUser?: any;
}

export function AdsTab({ projectId, metaAdAccountId, adReports, currentUser }: AdsTabProps) {
    const isClient = currentUser?.role === 'CLIENTE';
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [editingReportId, setEditingReportId] = useState<string | null>(null);

    // Find the selected report
    const selectedReport = selectedReportId
        ? adReports.find(r => r.id === selectedReportId)
        : null;

    const handleViewReport = (reportId: string) => {
        setSelectedReportId(reportId);
    };

    const handleCloseReport = () => {
        setSelectedReportId(null);
    };

    // Group reports by creation day
    const groupedReports = useMemo(() => {
        const groups: Record<string, typeof adReports> = {};
        adReports.forEach(report => {
            const day = format(new Date(report.createdAt), 'yyyy-MM-dd');
            if (!groups[day]) groups[day] = [];
            groups[day].push(report);
        });
        // Sort by date desc
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [adReports]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Publicidad & Campañas</h3>
                    <p className="text-sm text-muted-foreground">
                        Seguimiento de métricas y reportes de campañas
                    </p>
                </div>
                {!isClient && (
                    <AdReportForm projectId={projectId} currentUserId={currentUser?.id} />
                )}
            </div>

            {/* Meta Ads Insights - Hidden until integration is ready */}
            {/* <MetaAdsInsights projectId={projectId} metaAdAccountId={metaAdAccountId} /> */}

            {/* Google Ads Insights - Hidden until integration is ready */}
            {/* <Card className="bg-card border-border/50 opacity-50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Chrome className="h-4 w-4" />
                        Google Ads Insights
                        <Badge variant="outline" className="ml-2">Próximamente</Badge>
                    </CardTitle>
                    <CardDescription>
                        Datos automáticos de Google Ads
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        La integración con Google Ads estará disponible próximamente.
                    </div>
                </CardContent>
            </Card> */}

            {/* Manual Campaign Reports */}
            <div>
                <h4 className="font-medium mb-4">Reportes Manuales</h4>
                {adReports.length === 0 ? (
                    <Card className="bg-card border-border/50 border-dashed">
                        <CardContent className="py-8 text-center">
                            <div className="text-muted-foreground mb-2">No hay reportes manuales</div>
                            {!isClient && (
                                <p className="text-sm text-muted-foreground">
                                    Crea tu primer reporte para documentar el rendimiento de tus campañas
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {groupedReports.map(([day, reports]) => (
                            <div key={day} className="space-y-3">
                                <h5 className="text-sm font-medium text-muted-foreground capitalize">
                                    {format(parseISO(day), "EEEE, d 'de' MMMM", { locale: es })}
                                </h5>
                                <div className="space-y-3">
                                    {reports.map((report) => (
                                        <AdReportCard
                                            key={report.id}
                                            report={report}
                                            projectId={projectId}
                                            onViewReport={handleViewReport}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Report View Dialog */}
            <AdReportView
                report={selectedReport}
                projectId={projectId}
                currentUser={currentUser}
                onClose={handleCloseReport}
                onEdit={(reportId) => setEditingReportId(reportId)}
            />

            {/* Edit Report Dialog */}
            {editingReportId && (
                <AdReportForm
                    projectId={projectId}
                    currentUserId={currentUser?.id}
                    initialData={adReports.find(r => r.id === editingReportId)}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setEditingReportId(null);
                    }}
                    onSuccess={() => setEditingReportId(null)}
                />
            )}
        </div>
    );
}
