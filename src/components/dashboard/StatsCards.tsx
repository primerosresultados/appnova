import { getDashboardStats } from "@/app/actions/dashboard-actions";
import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban, Clock, AlertTriangle, BarChart3 } from "lucide-react";

export async function StatsCards({ period = '30d' }: { period?: string }) {
    const stats = await getDashboardStats(period);

    return (
        <div className="grid gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-12">
            {[
                { title: "TOTAL PROYECTOS", value: stats.totalProjects.toString(), icon: FolderKanban, color: "text-blue-500", bg: "bg-blue-500/10" },
                { title: "ACTIVOS", value: stats.activeProjects.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
                { title: "TIEMPOS CRÍTICOS", value: stats.criticalTasks.toString(), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
                { title: "% CUMPLIMIENTO", value: `${stats.completionPercentage}%`, icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" }
            ].map((item, i) => (
                <Card key={i} className="bg-card backdrop-blur-sm border-border/50 hover:bg-accent/50 active:bg-accent transition-all duration-300 group overflow-hidden relative">
                    <CardContent className="p-4 md:p-6 flex items-center gap-3 md:gap-6">
                        <div className={`h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
                            <item.icon className={`h-6 w-6 md:h-8 md:w-8 ${item.color}`} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {item.title}
                            </p>
                            <div className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-foreground">{item.value}</div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
