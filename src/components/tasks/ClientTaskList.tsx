"use client";

import { useState, useMemo } from "react";
import { TaskStatusSelect } from "@/components/tasks/TaskStatusSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Circle, Clock, CheckCircle2, User, ArrowUpRight, Eye, EyeOff, List, BarChart3, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval,
    addMonths, subMonths, isSameDay, isSameMonth, startOfWeek, endOfWeek,
    differenceInCalendarDays, min as minDate, max as maxDate, isWithinInterval,
    getDay
} from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const statusMap: Record<string, { label: string; color: string; icon: any; barColor: string }> = {
    TODO: { label: "Pendiente", color: "bg-slate-500/10 text-slate-500", icon: Circle, barColor: "bg-slate-400" },
    IN_PROGRESS: { label: "En Progreso", color: "bg-amber-500/10 text-amber-500", icon: Clock, barColor: "bg-amber-500" },
    REVIEW: { label: "Revisión", color: "bg-purple-500/10 text-purple-500", icon: CheckCircle2, barColor: "bg-purple-500" },
    DONE: { label: "Completado", color: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2, barColor: "bg-emerald-500" },
};

const priorityMap: Record<string, { label: string; color: string }> = {
    LOW: { label: "Baja", color: "text-slate-500 bg-slate-500/10" },
    MEDIUM: { label: "Media", color: "text-amber-500 bg-amber-500/10" },
    HIGH: { label: "Alta", color: "text-red-500 bg-red-500/10" },
};

type ViewTab = "lista" | "gantt" | "calendario";

interface ClientTaskListProps {
    initialTasks: any[];
    users: { id: string; name: string | null }[];
    userRole: string;
}

export function ClientTaskList({ initialTasks, users, userRole }: ClientTaskListProps) {
    const [filterUserId, setFilterUserId] = useState<string>("ALL");
    const [showCompleted, setShowCompleted] = useState(true);
    const [activeTab, setActiveTab] = useState<ViewTab>("lista");
    const [ganttMonth, setGanttMonth] = useState(new Date());
    const [calMonth, setCalMonth] = useState(new Date());

    const canFilter = userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'KAM';

    const filteredTasks = canFilter && filterUserId !== "ALL"
        ? initialTasks.filter(task => task.assigneeId === filterUserId)
        : initialTasks;

    const finalTasks = showCompleted ? filteredTasks : filteredTasks.filter(t => t.status !== 'DONE');

    const tabs: { key: ViewTab; label: string; icon: any }[] = [
        { key: "lista", label: "Lista", icon: List },
        { key: "gantt", label: "Gantt", icon: BarChart3 },
        { key: "calendario", label: "Calendario", icon: CalendarDays },
    ];

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Mis Tareas
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">Gestión y seguimiento de todas las actividades asignadas.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {canFilter && (
                        <div className="flex-1 md:w-[200px] space-y-1">
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
                        className="h-9 gap-2 shrink-0 mt-auto"
                    >
                        {showCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="hidden sm:inline">{showCompleted ? "Ocultar Completadas" : "Mostrar Completadas"}</span>
                    </Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/40 w-full">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={cn(
                            "flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1",
                            activeTab === key
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "lista" && <ListView tasks={finalTasks} />}
            {activeTab === "gantt" && (
                <GanttView
                    tasks={finalTasks}
                    month={ganttMonth}
                    onPrevMonth={() => setGanttMonth(subMonths(ganttMonth, 1))}
                    onNextMonth={() => setGanttMonth(addMonths(ganttMonth, 1))}
                />
            )}
            {activeTab === "calendario" && (
                <CalendarView
                    tasks={finalTasks}
                    month={calMonth}
                    onPrevMonth={() => setCalMonth(subMonths(calMonth, 1))}
                    onNextMonth={() => setCalMonth(addMonths(calMonth, 1))}
                />
            )}
        </div>
    );
}

/* ─────────────────────────────── LIST VIEW ──────────────────────── */
function ListView({ tasks }: { tasks: any[] }) {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-20 border border-dashed rounded-xl bg-card">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Todo al día</h3>
                <p className="text-muted-foreground">No hay tareas pendientes con este filtro.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {tasks.map((task) => (
                <div key={task.id} className="group relative flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-border/40 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-200 shadow-sm active:bg-accent cursor-pointer overflow-hidden">
                    <Link href={`/tasks/${task.id}`} className="absolute inset-0 z-0 focus:outline-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex-1 min-w-0 z-0 flex flex-col gap-1.5 pointer-events-none">
                        <div className="flex items-center gap-2">
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

                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 z-0 mt-1 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/30 pointer-events-none">
                        <Badge variant="secondary" className={`${priorityMap[task.priority]?.color} border-transparent text-[10px] px-1.5 h-5`}>
                            {priorityMap[task.priority]?.label}
                        </Badge>

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
            ))}
        </div>
    );
}

/* ─────────────────────────────── GANTT VIEW ──────────────────────── */
function GanttView({ tasks, month, onPrevMonth, onNextMonth }: { tasks: any[]; month: Date; onPrevMonth: () => void; onNextMonth: () => void }) {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const today = new Date();

    // Only tasks with at least a dueDate
    const ganttTasks = useMemo(() => {
        return tasks
            .filter(t => t.dueDate)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [tasks]);

    return (
        <div className="space-y-3">
            {/* Month nav */}
            <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-sm font-semibold capitalize">
                    {format(month, "MMMM yyyy", { locale: es })}
                </h3>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="border border-border/40 rounded-xl overflow-hidden bg-card">
                {/* Day headers */}
                <div className="flex border-b border-border/30">
                    <div className="w-[200px] lg:w-[260px] shrink-0 p-2 text-[10px] font-bold text-muted-foreground uppercase border-r border-border/30 bg-muted/30">
                        Tarea
                    </div>
                    <div className="flex-1 flex overflow-x-auto scrollbar-none">
                        {daysInMonth.map(day => {
                            const isToday = isSameDay(day, today);
                            const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                            return (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "flex-1 min-w-[28px] text-center py-1.5 text-[9px] font-medium border-r border-border/10 last:border-r-0",
                                        isToday && "bg-primary/10 text-primary font-bold",
                                        isWeekend && !isToday && "bg-muted/30 text-muted-foreground/60"
                                    )}
                                >
                                    <span className="block">{format(day, "EEE", { locale: es }).charAt(0).toUpperCase()}</span>
                                    <span className="block">{format(day, "d")}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Task rows */}
                {ganttTasks.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        No hay tareas con fecha de vencimiento en este mes.
                    </div>
                ) : (
                    ganttTasks.map(task => {
                        const taskDue = new Date(task.dueDate);
                        const taskStart = task.createdAt ? new Date(task.createdAt) : taskDue;
                        const st = statusMap[task.status] || statusMap.TODO;

                        // Calculate bar position relative to month
                        const barStart = maxDate([taskStart, monthStart]);
                        const barEnd = minDate([taskDue, monthEnd]);
                        const totalDays = daysInMonth.length;

                        const startOffset = differenceInCalendarDays(barStart, monthStart);
                        const barLength = Math.max(1, differenceInCalendarDays(barEnd, barStart) + 1);

                        // Skip if entirely outside month
                        const isInMonth = taskDue >= monthStart && taskStart <= monthEnd;
                        if (!isInMonth) return null;

                        const leftPct = (startOffset / totalDays) * 100;
                        const widthPct = (barLength / totalDays) * 100;

                        return (
                            <Link key={task.id} href={`/tasks/${task.id}`} className="flex border-b border-border/20 last:border-b-0 hover:bg-accent/30 transition-colors group">
                                {/* Task label */}
                                <div className="w-[200px] lg:w-[260px] shrink-0 p-2 border-r border-border/30 flex items-center gap-2 min-w-0">
                                    <div className={cn("w-2 h-2 rounded-full shrink-0", st.barColor)} />
                                    <span className="text-xs font-medium truncate group-hover:text-primary transition-colors">{task.title}</span>
                                    {task.assignee && (
                                        <Avatar className="h-4 w-4 shrink-0 ml-auto">
                                            <AvatarFallback className="text-[7px] bg-primary/10 text-primary font-bold">
                                                {task.assignee.name?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                                {/* Bar area */}
                                <div className="flex-1 relative h-10 overflow-x-auto scrollbar-none">
                                    {/* Today marker */}
                                    {isSameMonth(today, month) && (
                                        <div
                                            className="absolute top-0 bottom-0 w-px bg-primary/40 z-10"
                                            style={{ left: `${((differenceInCalendarDays(today, monthStart)) / totalDays) * 100}%` }}
                                        />
                                    )}
                                    <div
                                        className={cn(
                                            "absolute top-2 h-6 rounded-md flex items-center px-1.5 text-[9px] font-medium text-white shadow-sm transition-all",
                                            st.barColor,
                                            task.status === "DONE" && "opacity-60"
                                        )}
                                        style={{
                                            left: `${leftPct}%`,
                                            width: `${Math.max(widthPct, 3)}%`,
                                        }}
                                        title={`${format(taskStart, "d MMM", { locale: es })} — ${format(taskDue, "d MMM", { locale: es })}`}
                                    >
                                        <span className="truncate hidden sm:inline">{format(taskDue, "d MMM", { locale: es })}</span>
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

/* ─────────────────────────── CALENDAR VIEW ──────────────────────── */
function CalendarView({ tasks, month, onPrevMonth, onNextMonth }: { tasks: any[]; month: Date; onPrevMonth: () => void; onNextMonth: () => void }) {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calDays = eachDayOfInterval({ start: calStart, end: calEnd });
    const today = new Date();

    const tasksByDay = useMemo(() => {
        const map: Record<string, any[]> = {};
        tasks.forEach(t => {
            if (!t.dueDate) return;
            const key = format(new Date(t.dueDate), "yyyy-MM-dd");
            if (!map[key]) map[key] = [];
            map[key].push(t);
        });
        return map;
    }, [tasks]);

    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    return (
        <div className="space-y-3">
            {/* Month nav */}
            <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-sm font-semibold capitalize">
                    {format(month, "MMMM yyyy", { locale: es })}
                </h3>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="border border-border/40 rounded-xl overflow-hidden bg-card">
                {/* Day name headers */}
                <div className="grid grid-cols-7 border-b border-border/30">
                    {dayNames.map(name => (
                        <div key={name} className="p-2 text-center text-[10px] font-bold text-muted-foreground uppercase bg-muted/30">
                            {name}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                    {calDays.map(day => {
                        const key = format(day, "yyyy-MM-dd");
                        const dayTasks = tasksByDay[key] || [];
                        const isToday = isSameDay(day, today);
                        const isCurrentMonth = isSameMonth(day, month);

                        return (
                            <div
                                key={key}
                                className={cn(
                                    "min-h-[90px] p-1.5 border-b border-r border-border/20 last:border-r-0 transition-colors",
                                    !isCurrentMonth && "bg-muted/20 opacity-50",
                                    isToday && "bg-primary/5"
                                )}
                            >
                                <div className={cn(
                                    "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                                    isToday && "bg-primary text-primary-foreground font-bold"
                                )}>
                                    {format(day, "d")}
                                </div>
                                <div className="space-y-0.5">
                                    {dayTasks.slice(0, 3).map(task => {
                                        const st = statusMap[task.status] || statusMap.TODO;
                                        return (
                                            <Link
                                                key={task.id}
                                                href={`/tasks/${task.id}`}
                                                className={cn(
                                                    "block text-[9px] leading-tight font-medium truncate px-1.5 py-0.5 rounded",
                                                    st.barColor, "text-white",
                                                    "hover:opacity-80 transition-opacity"
                                                )}
                                                title={`${task.title} — ${st.label}`}
                                            >
                                                {task.title}
                                            </Link>
                                        );
                                    })}
                                    {dayTasks.length > 3 && (
                                        <span className="text-[9px] text-muted-foreground px-1.5">+{dayTasks.length - 3} más</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
