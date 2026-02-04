'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MetaAdsInsights } from './MetaAdsInsights';
import { AdReportForm } from './AdReportForm';
import { AdReportCard } from './AdReportCard';

interface AdsTabProps {
    projectId: string;
    metaAdAccountId: string | null;
    adReports: any[];
    currentUser?: any;
}

export function AdsTab({ projectId, metaAdAccountId, adReports, currentUser }: AdsTabProps) {
    const isClient = currentUser?.role === 'CLIENTE';

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

            {/* Meta Ads Insights - Auto-fetched data */}
            <MetaAdsInsights projectId={projectId} metaAdAccountId={metaAdAccountId} />

            {/* Google Ads Placeholder */}
            <Card className="bg-card border-border/50 opacity-50">
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
            </Card>

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
                    <div className="space-y-4">
                        {adReports.map((report) => (
                            <AdReportCard
                                key={report.id}
                                report={report}
                                projectId={projectId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
