
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { getDashboardStats } from "@/app/actions/dashboard-actions";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { Suspense } from "react";
import { AttentionCenter } from "@/components/dashboard/AttentionCenter";
import { getAttentionItems, getCalendarEvents } from "@/app/actions/dashboard-actions";
import { getUserSession } from "@/app/actions/auth-actions";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";

export const dynamic = 'force-dynamic';

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

async function getRecentActivity() {
  try {
    const logs = await db.actionLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        project: true,
      }
    });
    return logs;
  } catch (error) {
    return [];
  }
}

function getActionText(type: string) {
  switch (type) {
    case 'NOTE': return 'dejó una nota en';
    case 'TASK': return 'creó una tarea en';
    case 'MEETING': return 'agendó reunión en';
    case 'EMAIL': return 'envió correo en';
    case 'WARNING': return 'reportó problema en';
    case 'MILESTONE': return 'creó un hito en';
    default: return 'actualizó';
  }
}

function getActionColor(type: string) {
  switch (type) {
    case 'NOTE': return 'bg-blue-500/20 text-blue-500';
    case 'TASK': return 'bg-emerald-500/20 text-emerald-500';
    case 'WARNING': return 'bg-red-500/20 text-red-500';
    case 'MILESTONE': return 'bg-purple-500/20 text-purple-500';
    default: return 'bg-gray-500/20 text-gray-500';
  }
}

interface SearchParamsProps {
  searchParams: Promise<{
    period?: string;
  }>;
}

export default async function Dashboard({ searchParams }: SearchParamsProps) {
  const user = await getUserSession();

  // Redirect or show client specific dashboard
  if (user?.role === 'CLIENTE') {
    return (
      <div className="p-6">
        <ClientDashboard />
      </div>
    );
  }

  const params = await searchParams;
  const period = params?.period || '30d';
  const stats = await getDashboardStats(period);
  const attentionItems = await getAttentionItems();
  const recentActivity = await getRecentActivity();

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
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
        <div className="flex items-center gap-3">
          <Suspense>
            <DashboardToolbar />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {[
          { title: "TOTAL PROYECTOS", value: stats.totalProjects.toString(), icon: FolderKanban, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "ACTIVOS", value: "3", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "TIEMPOS CRÍTICOS", value: "1", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
          { title: "% CUMPLIMIENTO", value: "32%", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" }
        ].map((item, i) => (
          <Card key={i} className="bg-card backdrop-blur-sm border-border/50 hover:bg-accent/50 active:bg-accent transition-all duration-300 group overflow-hidden relative">
            <CardContent className="p-6 flex items-center gap-6">
              <div className={`h-16 w-16 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
                <item.icon className={`h-8 w-8 ${item.color}`} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {item.title}
                </p>
                <div className="text-4xl font-black tracking-tight text-foreground">{item.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card backdrop-blur-sm border-border/50">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Resumen de Ingresos</CardTitle>
            <CardDescription className="text-xs md:text-sm">Rendimiento mensual del trimestre.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:pl-2">
            <div className="h-[200px] md:h-[300px] w-full">
              <OverviewChart data={stats.chartData || []} />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <AttentionCenter
            overdueTasks={attentionItems.overdueTasks}
            pendingInvoices={attentionItems.pendingInvoices}
            urgentProjects={attentionItems.urgentProjects}
          />

          <Card className="bg-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No hay actividad reciente.</p>
                ) : (
                  recentActivity.slice(0, 3).map((log: any) => (
                    <div key={log.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <Avatar className={`h-9 w-9 border-0 ${getActionColor(log.type)}`}>
                        <AvatarFallback className="bg-transparent font-bold">
                          {log.user?.name ? log.user.name.substring(0, 2).toUpperCase() : 'Sys'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          <span className="text-foreground">{log.user?.name || 'Sistema'}</span> <span className="text-muted-foreground font-normal">{getActionText(log.type)}</span> <span className="text-foreground font-medium">{log.project?.name || 'un proyecto'}</span>
                        </p>
                        <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


