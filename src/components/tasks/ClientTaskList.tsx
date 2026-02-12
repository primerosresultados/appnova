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
                        return (
                            <div key={task.id} className="group relative flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-border/40 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-200 shadow-sm active:bg-accent cursor-pointer overflow-hidden">
                                <Link href={`/tasks/${task.id}`} className="absolute inset-0 z-0 focus:outline-none" />

                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                {/* Left: Status & Title & Context */}
                                <div className="flex-1 min-w-0 z-0 flex flex-col gap-1.5 pointer-events-none">
                                    <div className="flex items-center gap-2">
                                        {/* Status moved to right */}
                                        <h3 className="text-sm md:text-base font-bold group-hover:text-primary transition-colors truncate">
                                            {task.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                        <div className="flex items-center gap-1 min-w-0">
                                            <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-normal border-border/50 bg-background/50">
                                                {task.project.name}
                                            </Badge>
                                            <span className="hidden md:inline text-muted-foreground/40">•</span>
                                            <span className="flex items-center gap-1 truncate">
                                                <User className="h-3 w-3 opacity-70" />
                                                <span className="truncate">{task.project.client.name}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Meta Info (Priority, Assignee, Date) */}
                                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 z-0 mt-1 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/30 pointer-events-none">
                                    {/* Priority */}
                                    <Badge variant="secondary" className={`${priorityMap[task.priority]?.color} border-transparent text-[10px] px-1.5 h-5`}>
                                        {priorityMap[task.priority]?.label}
                                    </Badge>

                                    {/* Assignee */}
                                    <div className="flex items-center gap-2" title={`Asignado a: ${task.assignee?.name || "Sin asignar"}`}>
                                        <span className="text-xs text-muted-foreground hidden lg:inline-block max-w-[80px] truncate text-right">
                                            {task.assignee?.name?.split(' ')[0] || "Sin asignar"}
                                        </span>
                                        <Avatar className="h-6 w-6 border border-background shadow-sm">
                                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                                {task.assignee?.name?.substring(0, 2).toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    {/* Due Date */}
                                    {task.dueDate && (
                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${differenceInDays(new Date(task.dueDate), new Date()) < 0 ? 'text-destructive' :
                                            differenceInDays(new Date(task.dueDate), new Date()) <= 2 ? 'text-amber-500' :
                                                'text-muted-foreground'
                                            }`}>
                                            <Clock className="h-3.5 w-3.5 opacity-70" />
                                            <span>{format(new Date(task.dueDate), 'd MMM')}</span>
                                        </div>
                                    )}

                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ml-1 hidden md:block" />

                                    <div className="pl-2 border-l border-border/30 ml-2 pointer-events-auto z-10 relative">
                                        <TaskStatusSelect taskId={task.id} status={task.status} variant="minimal" />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
