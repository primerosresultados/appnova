'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, RefreshCw, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MetaInsights {
    reach: number;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    dateRange: {
        start: string;
        end: string;
    };
    adAccountName?: string;
}

interface MetaAdsInsightsProps {
    projectId: string;
    metaAdAccountId: string | null;
}

export function MetaAdsInsights({ projectId, metaAdAccountId }: MetaAdsInsightsProps) {
    const [insights, setInsights] = useState<MetaInsights | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState('30');

    useEffect(() => {
        if (metaAdAccountId) {
            fetchInsights();
        }
    }, [metaAdAccountId, days]);

    const fetchInsights = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/meta/insights?projectId=${projectId}&days=${days}`);
            const data = await response.json();

            if (data.success) {
                setInsights(data.data);
            } else {
                setError(data.error || 'Failed to fetch insights');
            }
        } catch (err) {
            setError('Failed to fetch Meta Ads insights');
            console.error('Error fetching Meta insights:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!metaAdAccountId) {
        return (
            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Meta Ads Insights
                    </CardTitle>
                    <CardDescription>
                        Datos automáticos de Meta Ads
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                        No hay una cuenta publicitaria vinculada a este proyecto.
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/projects/${projectId}?tab=resources`}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Vincular Cuenta
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card border-border/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Meta Ads Insights
                        </CardTitle>
                        <CardDescription>
                            {insights?.adAccountName || 'Datos automáticos de Meta Ads'}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={days} onValueChange={setDays}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Últimos 7 días</SelectItem>
                                <SelectItem value="30">Últimos 30 días</SelectItem>
                                <SelectItem value="90">Últimos 90 días</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchInsights}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-sm text-destructive">
                        {error}
                    </div>
                ) : insights ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Alcance</div>
                            <div className="text-2xl font-bold">{insights.reach.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Impresiones</div>
                            <div className="text-2xl font-bold">{insights.impressions.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Clics</div>
                            <div className="text-2xl font-bold">{insights.clicks.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Gasto</div>
                            <div className="text-2xl font-bold">${insights.spend.toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Conversiones</div>
                            <div className="text-2xl font-bold">{insights.conversions.toLocaleString()}</div>
                        </div>
                    </div>
                ) : null}
                {insights && (
                    <div className="text-xs text-muted-foreground mt-4">
                        Desde {new Date(insights.dateRange.start).toLocaleDateString('es-ES')} hasta{' '}
                        {new Date(insights.dateRange.end).toLocaleDateString('es-ES')}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
