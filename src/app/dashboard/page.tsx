
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { getUserSession } from "@/app/actions/auth-actions";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { getClientProjects } from "@/app/actions/client-actions";

// Widgets
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { ActivityWidget } from "@/components/dashboard/ActivityWidget";
import { AttentionWidget } from "@/components/dashboard/AttentionWidget";
import { IncomeChartWidget } from "@/components/dashboard/IncomeChartWidget";

// Skeletons
import {
  StatsSkeleton,
  CalendarSkeleton,
  ActivitySkeleton,
  AttentionSkeleton,
  IncomeChartSkeleton
} from "@/components/dashboard/DashboardSkeletons";


interface SearchParamsProps {
  searchParams: Promise<{
    period?: string;
  }>;
}

export default async function Dashboard({ searchParams }: SearchParamsProps) {
  const user = await getUserSession();

  // Redirect or show client specific dashboard
  if (user?.role === 'CLIENTE') {
    const projectsResult = await getClientProjects();
    const projects = projectsResult.data || [];

    return (
      <div className="p-6">
        <ClientDashboard initialProjects={projects} user={user} />
      </div>
    );
  }

  const params = await searchParams;
  const period = params?.period || '30d';

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in-50 duration-500 max-w-full overflow-x-hidden p-1">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase">
            Panel de Control
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <span className="font-bold">Resumen General</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <Badge variant="secondary" className="bg-muted text-[10px] tracking-widest uppercase font-bold text-muted-foreground rounded-md px-2">Vista Gerencia</Badge>
          </div>
        </div>
      </div>

      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarWidget />
      </Suspense>

      {/* AttentionWidget: renders ONCE, CSS controls mobile/desktop placement */}
      <Suspense fallback={<AttentionSkeleton />}>
        <AttentionWidget />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards period={period} />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-7">
        <Suspense fallback={<IncomeChartSkeleton />}>
          <IncomeChartWidget period={period} />
        </Suspense>

        <div className="lg:col-span-3 space-y-4">
          <Suspense fallback={<ActivitySkeleton />}>
            <ActivityWidget />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

