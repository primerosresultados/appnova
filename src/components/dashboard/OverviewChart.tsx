"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Lazy-load recharts (~200KB) — only loaded when this component renders
const LazyAreaChart = dynamic(
    () => import('recharts').then(mod => ({ default: mod.AreaChart })),
    { ssr: false }
);
const LazyArea = dynamic(
    () => import('recharts').then(mod => ({ default: mod.Area })),
    { ssr: false }
);
const LazyXAxis = dynamic(
    () => import('recharts').then(mod => ({ default: mod.XAxis })),
    { ssr: false }
);
const LazyYAxis = dynamic(
    () => import('recharts').then(mod => ({ default: mod.YAxis })),
    { ssr: false }
);
const LazyCartesianGrid = dynamic(
    () => import('recharts').then(mod => ({ default: mod.CartesianGrid })),
    { ssr: false }
);
const LazyTooltip = dynamic(
    () => import('recharts').then(mod => ({ default: mod.Tooltip })),
    { ssr: false }
);
const LazyResponsiveContainer = dynamic(
    () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
    { ssr: false }
);

interface OverviewChartProps {
    data: any[];
}

export function OverviewChart({ data }: OverviewChartProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="h-full w-full bg-muted/10 animate-pulse rounded-md" />;
    }

    return (
        <LazyResponsiveContainer width="100%" height="100%">
            <LazyAreaChart data={data}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <LazyXAxis
                    dataKey="name"
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <LazyYAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => `$${value}`}
                />
                <LazyTooltip
                    contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius)' }}
                    itemStyle={{ color: 'var(--color-foreground)' }}
                />
                <LazyArea
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                />
            </LazyAreaChart>
        </LazyResponsiveContainer>
    );
}

