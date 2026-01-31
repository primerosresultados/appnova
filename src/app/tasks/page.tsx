
export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, ArrowUpRight, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    TODO: { label: "Pendiente", color: "bg-slate-500/10 text-slate-500", icon: Circle },
    IN_PROGRESS: { label: "En Progreso", color: "bg-amber-500/10 text-amber-500", icon: Clock },
    REVIEW: { label: "Revisión", color: "bg-purple-500/10 text-purple-500", icon: CheckCircle2 },
    DONE: { label: "Completado", color: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2 },
};

const priorityMap: Record<string, { label: string; color: string }> = {
    LOW: { label: "Baja", color: "text-slate-500 bg-slate-500/10" },
    MEDIUM: { label: "Media", color: "text-amber-500 bg-amber-500/10" },
    HIGH: { label: "Alta", color: "text-red-500 bg-red-500/10" },
};

export default async function TasksPage() {
    let tasks: any[] = [];
    let dbError = null;

    try {
        tasks = await db.task.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                project: {
                    include: { client: true }
                },
                assignee: true
            }
        });
    } catch (error: any) {
        console.error("Error fetching tasks:", error);
        dbError = error.message;
    }

    return (
        <div className="space-y-4 md:space-y-8 animate-in fade-in-50 duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Mis Tareas
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Gestión y seguimiento de todas las actividades asignadas.</p>
                </div>
            </div>

            {/* Error Alert */}
            {dbError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-4 text-sm">
                    <strong>Error de Conexión:</strong> {dbError}
                    <br />
                    Verifica la variable <code>DATABASE_URL</code> en Vercel.
                </div>
            )}

            {/* Task List */}
            <div className="grid gap-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-20 border border-dashed rounded-xl bg-card/30">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">Todo al día</h3>
                        <p className="text-muted-foreground">No hay tareas pendientes en este momento.</p>
                    </div>
                ) : (
                    tasks.map((task) => {
                        const status = statusMap[task.status] || statusMap.TODO;
                        const StatusIcon = status.icon;

                        return (
                            <Link key={task.id} href={`/tasks/${task.id}`}>
                                <div className="group flex flex-col gap-3 p-4 md:p-5 rounded-xl border border-border/40 bg-card/40 hover:bg-card/60 hover:border-primary/20 transition-all duration-300 shadow-sm active:bg-card/80 cursor-pointer relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex-1 z-10">
                                        <div className="flex items-center flex-wrap gap-2 mb-2">
                                            <Badge variant="outline" className={`${status.color} border-transparent font-medium text-xs`}>
                                                <StatusIcon className="mr-1 h-3 w-3" />
                                                {status.label}
                                            </Badge>
                                            <Badge variant="secondary" className={`${priorityMap[task.priority]?.color} border-transparent text-xs`}>
                                                {priorityMap[task.priority]?.label}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {format(new Date(task.createdAt), 'dd MMM', { locale: es })}
                                            </span>
                                        </div>

                                        <h3 className="text-base md:text-lg font-semibold group-hover:text-primary transition-colors mb-2 line-clamp-2">
                                            {task.title}
                                        </h3>

                                        <div className="flex items-center flex-wrap gap-2 text-xs md:text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-background/50 border border-border/20">
                                                <Badge variant="outline" className="h-2 w-2 p-0 rounded-full bg-primary/20 border-primary/40" />
                                                <span className="truncate max-w-[120px]">{task.project.name}</span>
                                            </div>
                                            <span className="flex items-center gap-1 text-xs">
                                                <User className="h-3 w-3" />
                                                <span className="truncate max-w-[100px]">{task.project.client.name}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-border/20 z-10">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6 border-2 border-background">
                                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                                    {task.assignee?.name?.substring(0, 2).toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs md:text-sm font-medium">{task.assignee?.name || "Sin asignar"}</span>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
