
export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CreditCard, DollarSign, Users, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { getDashboardStats } from "@/app/actions/dashboard-actions";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { Suspense } from "react";
import { AttentionCenter } from "@/components/dashboard/AttentionCenter";
import { getAttentionItems, getCalendarEvents } from "@/app/actions/dashboard-actions";
import { MasterCalendar } from "@/components/dashboard/MasterCalendar";


const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
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
  const params = await searchParams;
  const period = params?.period || '30d';
  const stats = await getDashboardStats(period);
  const attentionItems = await getAttentionItems();
  const calendarData = await getCalendarEvents();
  const recentActivity = await getRecentActivity();
  const formattedTotalIncome = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(stats.totalIncome);

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Centro de Comando
        </h1>
      </div>

      {/* Master Calendar */}
      <MasterCalendar events={calendarData.events} users={calendarData.users} />

      <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mt-8">
        <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-wider">Métricas Clave</h2>
        <Suspense>
          <DashboardToolbar />
        </Suspense>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Ingresos", value: formattedTotalIncome, change: "+0% mes", icon: DollarSign, color: "text-emerald-500" },
          { title: "Proyectos", value: stats.totalProjects.toString(), change: "En curso", icon: FolderKanban, color: "text-blue-500" },
          { title: "Satisfacción", value: "98.2%", change: "+4% mes", icon: TrendingUp, color: "text-amber-500" },
          { title: "Clientes", value: stats.activeClients.toString(), change: "Activos", icon: Users, color: "text-purple-500" }
        ].map((item, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 active:bg-card transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {item.title}
              </CardTitle>
              <item.icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-2xl font-bold tracking-tight">{item.value}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                <span className="text-emerald-500 font-medium">{item.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card/50 backdrop-blur-sm border-border/50">
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

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas actualizaciones de tu equipo y clientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No hay actividad reciente.</p>
                ) : (
                  recentActivity.slice(0, 3).map((log: any) => (
                    <div key={log.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors">
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

function FolderKanban(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}
