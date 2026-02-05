import { getDashboardStats } from "@/app/actions/dashboard-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { Suspense } from "react";

export async function IncomeChartWidget({ period = '30d' }: { period?: string }) {
    const stats = await getDashboardStats(period);

    return (
        <Card className="lg:col-span-4 bg-card backdrop-blur-sm border-border/50">
            <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between space-y-0 relative">
                <div className="space-y-1">
                    <CardTitle className="text-base md:text-lg">Resumen de Ingresos</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Rendimiento financiero.</CardDescription>
                </div>
                <div className="shrink-0 scale-90 md:scale-100 origin-right">
                    <Suspense>
                        <DashboardToolbar />
                    </Suspense>
                </div>
            </CardHeader>
            <CardContent className="p-2 md:pl-2">
                <div className="h-[200px] md:h-[300px] w-full">
                    <OverviewChart data={stats.chartData || []} />
                </div>
            </CardContent>
        </Card>
    );
}
