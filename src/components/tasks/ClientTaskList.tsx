"use client";

import { useState } from "react";
import { TaskStatusSelect } from "@/components/tasks/TaskStatusSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Circle, Clock, CheckCircle2, User, ArrowUpRight, Filter, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

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

interface ClientTaskListProps {
    initialTasks: any[];
    users: { id: string; name: string | null }[];
    userRole: string; // 'SUPERADMIN', 'ADMIN', 'KAM', 'STANDARD'
}

export function ClientTaskList({ initialTasks, users, userRole }: ClientTaskListProps) {
    const [filterUserId, setFilterUserId] = useState<string>("ALL");
    const [showCompleted, setShowCompleted] = useState(true);

    const canFilter = userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'KAM';

    const filteredTasks = canFilter && filterUserId !== "ALL"
        ? initialTasks.filter(task => task.assigneeId === filterUserId)
        : initialTasks;

    const finalTasks = showCompleted ? filteredTasks : filteredTasks.filter(t => t.status !== 'DONE');

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Mis Tareas
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">Gestión y seguimiento de todas las actividades asignadas.</p>
                </div>

                {canFilter && (
                    <div className="w-full md:w-[250px] space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Filtrar por usuario</Label>
                        <Select value={filterUserId} onValueChange={setFilterUserId}>
                            <SelectTrigger className="bg-card border-border/40 backdrop-blur-md h-9 text-sm">
                                <SelectValue placeholder="Todos los usuarios" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los usuarios</SelectItem>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name || "Sin Nombre"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="h-9 gap-2"
                >
                    {showCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showCompleted ? "Ocultar Completadas" : "Mostrar Completadas"}
                </Button>
            </div>

            <div className="grid gap-4">
                {finalTasks.length === 0 ? (
                    <div className="text-center py-20 border border-dashed rounded-xl bg-card">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">Todo al día</h3>
                        <p className="text-muted-foreground">No hay tareas pendientes con este filtro.</p>
                    </div>
                ) : (
                    finalTasks.map((task) => {
                        const status = statusMap[task.status] || statusMap.TODO;
                        // Rest of the component remains the same for item rendering logic provided it uses 'task'
                        const StatusIcon = status.icon;

                        return (
                            <Link key={task.id} href={`/tasks/${task.id}`}>
                                <div className="group flex flex-col gap-3 p-4 md:p-5 rounded-xl border border-border/40 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-300 shadow-sm active:bg-accent cursor-pointer relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex-1 z-10">
                                        <div className="flex items-center flex-wrap gap-2 mb-2">
                                            <TaskStatusSelect taskId={task.id} status={task.status} variant="minimal" />
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

                                        {/* Time Progress Tracking */}
                                        <div className="space-y-2 mb-4 bg-background/30 p-3 rounded-lg border border-border/20">
                                            <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Creado hace {differenceInDays(new Date(), new Date(task.createdAt))} días</span>
                                                </div>
                                                {task.dueDate && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span>Vence: {format(new Date(task.dueDate), 'dd MMM', { locale: es })}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {task.dueDate && (
                                                <div className="space-y-1">
                                                    <Progress
                                                        value={(() => {
                                                            const start = new Date(task.createdAt).getTime();
                                                            const end = new Date(task.dueDate).getTime();
                                                            const now = new Date().getTime();
                                                            if (now >= end) return 100;
                                                            const total = end - start;
                                                            if (total <= 0) return 100;
                                                            const elapsed = now - start;
                                                            return Math.min(100, Math.max(0, (elapsed / total) * 100));
                                                        })()}
                                                        className="h-1.5"
                                                    />
                                                    <div className="flex justify-end">
                                                        <span className="text-[10px] font-medium text-primary/70">
                                                            {(() => {
                                                                const diff = differenceInDays(new Date(task.dueDate), new Date());
                                                                if (diff < 0) return "Vencido";
                                                                if (diff === 0) return "Vence hoy";
                                                                return `Quedan ${diff} días`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

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
