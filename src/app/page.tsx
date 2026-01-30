
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
import { getAttentionItems } from "@/app/actions/dashboard-actions";


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
  searchParams?: {
    period?: string;
  };
}

export default async function Dashboard({ searchParams }: SearchParamsProps) {
  const period = searchParams?.period || '30d';
  const stats = await getDashboardStats(period);
  const attentionItems = await getAttentionItems();
  const recentActivity = await getRecentActivity();
  const formattedTotalIncome = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(stats.totalIncome);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Centro de Comando
        </h1>
        <Suspense>
          <DashboardToolbar />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Ingresos Totales", value: formattedTotalIncome, change: "+0% desde el mes pasado", icon: DollarSign, color: "text-emerald-500" },
          { title: "Proyectos Activos", value: stats.totalProjects.toString(), change: "Proyectos en curso", icon: FolderKanban, color: "text-blue-500" },
          { title: "Satisfacción del Cliente", value: "98.2%", change: "+4% desde el mes pasado", icon: TrendingUp, color: "text-amber-500" },
          { title: "Clientes Activos", value: stats.activeClients.toString(), change: "Empresas activas", icon: Users, color: "text-purple-500" }
        ].map((item, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{item.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-500 font-medium">{item.change.split(' ')[0]}</span> {item.change.split(' ').slice(1).join(' ')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Resumen de Ingresos</CardTitle>
            <CardDescription>Rendimiento mensual de ingresos para el trimestre actual.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <OverviewChart data={stats.chartData || []} />
            </div>
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-4">
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
                        <p className="text-xs text-muted-foreground">
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
