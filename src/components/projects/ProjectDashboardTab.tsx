"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    FileText, Target, MessageCircle, Palette, Pencil, Save, X,
    Image, Film, BookImage, LayoutGrid, Radio, Mail, PenLine,
    Calendar, DollarSign, CheckCircle2, ListTodo, BarChart3,
    Eye, Clock, AlertTriangle, CircleDot, TrendingUp, Users
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval, isPast, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { updateProject } from "@/app/projects/actions";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ProjectDashboardTabProps {
    project: any;
    conversions?: any[];
    contents?: any[];
    tasks?: any[];
}

const contentTypeConfig = [
    { key: "graficas", label: "Gráficas", icon: Image, color: "text-pink-500 bg-pink-500/10" },
    { key: "reels", label: "Reels", icon: Film, color: "text-violet-500 bg-violet-500/10" },
    { key: "historias", label: "Historias", icon: BookImage, color: "text-amber-500 bg-amber-500/10" },
    { key: "carruseles", label: "Carruseles", icon: LayoutGrid, color: "text-cyan-500 bg-cyan-500/10" },
    { key: "lives", label: "Lives", icon: Radio, color: "text-red-500 bg-red-500/10" },
    { key: "mailings", label: "Mailings", icon: Mail, color: "text-emerald-500 bg-emerald-500/10" },
    { key: "postSeos", label: "Post SEO", icon: PenLine, color: "text-blue-500 bg-blue-500/10" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    ACTIVE: { label: "Activo", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2 },
    ALERT: { label: "Alerta", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10", icon: AlertTriangle },
    CANCELLED: { label: "Cancelado", color: "text-red-600 bg-red-50 dark:bg-red-500/10", icon: X },
};

const contentStatusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Borrador", color: "bg-zinc-500/10 text-zinc-500" },
    REVIEW: { label: "Revisión", color: "bg-amber-500/10 text-amber-500" },
    APPROVED: { label: "Aprobado", color: "bg-emerald-500/10 text-emerald-500" },
    SCHEDULED: { label: "Programado", color: "bg-blue-500/10 text-blue-500" },
    PUBLISHED: { label: "Publicado", color: "bg-violet-500/10 text-violet-500" },
};

const contentTypeLabels: Record<string, string> = {
    SEO: "SEO", INSTAGRAM_POST: "IG Post", INSTAGRAM_STORY: "IG Story",
    INSTAGRAM_REEL: "IG Reel", FACEBOOK_POST: "FB Post", ADS_CAMPAIGN: "Campaña Ads",
    MAILING: "Mailing", CAROUSEL: "Carrusel", LIVE: "Live", GRAPHIC: "Gráfica",
};

export function ProjectDashboardTab({ project, conversions = [], contents = [], tasks = [] }: ProjectDashboardTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const result = await updateProject(project.id, formData);
        if (result.success) {
            toast.success("Proyecto actualizado");
            setIsEditing(false);
        } else {
            toast.error(result.message || "Error al guardar");
        }
        setIsSaving(false);
    };

    // Task stats
    const taskStats = useMemo(() => {
        const now = new Date();
        const total = tasks.length;
        const done = tasks.filter(t => t.status === "DONE").length;
        const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
        const review = tasks.filter(t => t.status === "REVIEW").length;
        const todo = tasks.filter(t => t.status === "TODO").length;
        const overdue = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== "DONE").length;
        const upcoming = tasks.filter(t => {
            if (!t.dueDate || t.status === "DONE") return false;
            const diff = differenceInDays(new Date(t.dueDate), now);
            return diff >= 0 && diff <= 3;
        }).length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        return { total, done, inProgress, review, todo, overdue, upcoming, progress };
    }, [tasks]);

    // Conversion stats
    const convStats = useMemo(() => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const monthConversions = conversions.filter(c =>
            isWithinInterval(new Date(c.date), { start: monthStart, end: monthEnd })
        );
        const totalAll = conversions.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalMonth = monthConversions.reduce((sum, c) => sum + (c.amount || 0), 0);
        const countAll = conversions.reduce((sum, c) => sum + (c.quantity || 1), 0);
        const countMonth = monthConversions.reduce((sum, c) => sum + (c.quantity || 1), 0);
        return { totalAll, totalMonth, countAll, countMonth };
    }, [conversions]);

    // Content stats
    const contentStats = useMemo(() => {
        const byStatus: Record<string, number> = {};
        contents.forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });
        return { total: contents.length, byStatus };
    }, [contents]);

    const hasContentPlan = contentTypeConfig.some(c => (project[c.key] || 0) > 0);

    // Overdue tasks list
    const overdueTasks = useMemo(() => {
        return tasks
            .filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== "DONE")
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 5);
    }, [tasks]);

    const stCfg = statusConfig[project.status] || statusConfig.ACTIVE;
    const StatusIcon = stCfg.icon;

    return (
        <div className="space-y-6">

            {/* Row 1: Status + Quick KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Status */}
                <Card className="border-border/50">
                    <CardContent className="p-3 flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", stCfg.color)}>
                            <StatusIcon className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Estado</p>
                            <p className="text-sm font-bold">{stCfg.label}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Progress */}
                <Card className="border-border/50">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <ListTodo className="h-3.5 w-3.5 text-blue-500" />
                            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Tareas</p>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold">{taskStats.done}</span>
                            <span className="text-xs text-muted-foreground">/ {taskStats.total}</span>
                        </div>
                        {taskStats.total > 0 && (
                            <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${taskStats.progress}%` }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Overdue */}
                <Card className={cn("border-border/50", taskStats.overdue > 0 && "border-amber-300/50 dark:border-amber-500/30")}>
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className={cn("h-3.5 w-3.5", taskStats.overdue > 0 ? "text-amber-500" : "text-muted-foreground")} />
                            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Vencidas</p>
                        </div>
                        <p className={cn("text-xl font-bold", taskStats.overdue > 0 ? "text-amber-600" : "text-muted-foreground")}>{taskStats.overdue}</p>
                    </CardContent>
                </Card>

                {/* In Progress */}
                <Card className="border-border/50">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <CircleDot className="h-3.5 w-3.5 text-violet-500" />
                            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">En Curso</p>
                        </div>
                        <p className="text-xl font-bold">{taskStats.inProgress + taskStats.review}</p>
                    </CardContent>
                </Card>

                {/* Conversions */}
                <Card className="border-border/50">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Conversiones</p>
                        </div>
                        <p className="text-xl font-bold">{convStats.countAll}</p>
                    </CardContent>
                </Card>

                {/* Content */}
                <Card className="border-border/50">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Eye className="h-3.5 w-3.5 text-pink-500" />
                            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Contenido</p>
                        </div>
                        <p className="text-xl font-bold">{contentStats.total}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Overdue Tasks + Conversions + Content Plan */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Overdue Tasks */}
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" /> Tareas Vencidas
                            {taskStats.overdue > 0 && (
                                <Badge variant="secondary" className="ml-auto text-[10px] bg-amber-500/10 text-amber-600">{taskStats.overdue}</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {overdueTasks.length === 0 ? (
                            <div className="flex flex-col items-center py-4 text-muted-foreground text-sm">
                                <CheckCircle2 className="h-8 w-8 mb-2 opacity-30" />
                                <p>Sin tareas vencidas</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {overdueTasks.map(task => {
                                    const daysOverdue = differenceInDays(new Date(), new Date(task.dueDate));
                                    return (
                                        <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium truncate">{task.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                                    <span className="text-amber-600 font-semibold">
                                                        {daysOverdue === 0 ? "Hoy" : `${daysOverdue}d atrás`}
                                                    </span>
                                                    {task.assignee && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-2.5 w-2.5" />
                                                            {task.assignee.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] shrink-0">
                                                {task.status === "TODO" ? "Pendiente" : task.status === "IN_PROGRESS" ? "En curso" : task.status}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Conversions Summary */}
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-orange-500" /> Conversiones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {conversions.length === 0 ? (
                            <div className="flex flex-col items-center py-4 text-muted-foreground text-sm">
                                <BarChart3 className="h-8 w-8 mb-2 opacity-30" />
                                <p>Sin conversiones</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/10">
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Este mes</p>
                                        <p className="text-lg font-bold text-orange-500">{convStats.countMonth}</p>
                                        {convStats.totalMonth > 0 && (
                                            <p className="text-[10px] text-muted-foreground">${convStats.totalMonth.toLocaleString("es-CL")}</p>
                                        )}
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Total</p>
                                        <p className="text-lg font-bold">{convStats.countAll}</p>
                                        {convStats.totalAll > 0 && (
                                            <p className="text-[10px] text-muted-foreground">${convStats.totalAll.toLocaleString("es-CL")}</p>
                                        )}
                                    </div>
                                </div>
                                {/* Recent conversions */}
                                <div className="space-y-1">
                                    {conversions.slice(0, 3).map(c => (
                                        <div key={c.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border/20 last:border-0">
                                            <span className="text-muted-foreground">{format(new Date(c.date), "d MMM", { locale: es })}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">{c.quantity || 1}x</span>
                                                {c.amount > 0 && <span className="font-medium">${c.amount.toLocaleString("es-CL")}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Content Plan */}
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Eye className="h-4 w-4 text-pink-500" /> Plan de Contenido
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!hasContentPlan && contents.length === 0 ? (
                            <div className="flex flex-col items-center py-4 text-muted-foreground text-sm">
                                <Eye className="h-8 w-8 mb-2 opacity-30" />
                                <p>Sin plan definido</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {hasContentPlan && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                        {contentTypeConfig.map(({ key, label, icon: Icon, color }) => {
                                            const count = project[key] || 0;
                                            if (count === 0) return null;
                                            return (
                                                <div key={key} className="text-center p-2 rounded-lg bg-muted/30 border border-border/30">
                                                    <Icon className={`h-3.5 w-3.5 mx-auto mb-0.5 ${color.split(' ')[0]}`} />
                                                    <p className="text-sm font-bold">{count}</p>
                                                    <p className="text-[8px] text-muted-foreground uppercase leading-tight">{label}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {contents.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {Object.entries(contentStats.byStatus).map(([status, count]) => {
                                            const cfg = contentStatusLabels[status] || { label: status, color: "bg-zinc-500/10 text-zinc-500" };
                                            return (
                                                <Badge key={status} variant="secondary" className={`text-[10px] ${cfg.color}`}>
                                                    {cfg.label}: {count}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Row 3: Task Breakdown by Status */}
            {taskStats.total > 0 && (
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <ListTodo className="h-4 w-4 text-blue-500" /> Progreso de Tareas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: "Pendientes", count: taskStats.todo, color: "bg-zinc-400", textColor: "text-zinc-600" },
                                { label: "En Progreso", count: taskStats.inProgress, color: "bg-blue-500", textColor: "text-blue-600" },
                                { label: "Revisión", count: taskStats.review, color: "bg-amber-500", textColor: "text-amber-600" },
                                { label: "Completadas", count: taskStats.done, color: "bg-emerald-500", textColor: "text-emerald-600" },
                            ].map(({ label, count, color, textColor }) => (
                                <div key={label} className="text-center">
                                    <p className={cn("text-2xl font-bold", textColor)}>{count}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex mt-3 h-2 rounded-full overflow-hidden bg-muted/30">
                            {taskStats.done > 0 && (
                                <div className="bg-emerald-500 transition-all" style={{ width: `${(taskStats.done / taskStats.total) * 100}%` }} />
                            )}
                            {taskStats.review > 0 && (
                                <div className="bg-amber-500 transition-all" style={{ width: `${(taskStats.review / taskStats.total) * 100}%` }} />
                            )}
                            {taskStats.inProgress > 0 && (
                                <div className="bg-blue-500 transition-all" style={{ width: `${(taskStats.inProgress / taskStats.total) * 100}%` }} />
                            )}
                            {taskStats.todo > 0 && (
                                <div className="bg-zinc-400 transition-all" style={{ width: `${(taskStats.todo / taskStats.total) * 100}%` }} />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">{taskStats.progress}% completado</p>
                    </CardContent>
                </Card>
            )}

            {/* Row 4: Recent Content */}
            {contents.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold mb-3">Contenido Reciente</h3>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {[...contents]
                            .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
                            .slice(0, 6)
                            .map(content => {
                                const statusCfg = contentStatusLabels[content.status] || { label: content.status, color: "bg-zinc-500/10 text-zinc-500" };
                                return (
                                    <Card key={content.id} className="border-border/50 overflow-hidden">
                                        {content.mediaUrl && (
                                            <div className="h-28 bg-muted/30 overflow-hidden">
                                                <img src={content.mediaUrl} alt={content.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <CardContent className={`p-3 ${content.mediaUrl ? '' : 'pt-3'}`}>
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="text-xs font-medium line-clamp-1">{content.title}</p>
                                                <Badge variant="secondary" className={`text-[9px] shrink-0 ${statusCfg.color}`}>
                                                    {statusCfg.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                <span>{contentTypeLabels[content.type] || content.type}</span>
                                                {content.publishDate && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-0.5">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            {format(new Date(content.publishDate), "d MMM", { locale: es })}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Row 5: Project Info */}
            {project.dueDate || project.budget ? (
                <div className="grid grid-cols-2 gap-3">
                    {project.dueDate && (
                        <Card className="border-border/50">
                            <CardContent className="p-3 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Vencimiento</p>
                                    <p className="text-sm font-semibold">{format(new Date(project.dueDate), "d MMM yyyy", { locale: es })}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {project.budget && (
                        <Card className="border-border/50">
                            <CardContent className="p-3 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <DollarSign className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Presupuesto</p>
                                    <p className="text-sm font-semibold">${Number(project.budget).toLocaleString("es-CL")}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : null}

            {/* Row 6: Brief del Proyecto */}
            <form onSubmit={handleSave}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Brief del Proyecto</h3>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                            </Button>
                            <Button type="submit" size="sm" disabled={isSaving}>
                                <Save className="h-3.5 w-3.5 mr-1" /> {isSaving ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>
                    ) : (
                        <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Editar Brief
                        </Button>
                    )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    {[
                        { name: "description", label: "Descripción", icon: FileText, color: "text-blue-500", placeholder: "Describe el proyecto...", value: project.description },
                        { name: "objectives", label: "Objetivos", icon: Target, color: "text-emerald-500", placeholder: "Ej: Aumentar seguidores un 30%...", value: project.objectives },
                        { name: "communicationTone", label: "Tono Comunicacional", icon: MessageCircle, color: "text-violet-500", placeholder: "Ej: Profesional pero cercano...", value: project.communicationTone },
                        { name: "brandManual", label: "Manual de Marca", icon: Palette, color: "text-pink-500", placeholder: "Ej: Colores, tipografía, enlace...", value: project.brandManual },
                    ].map(({ name, label, icon: Icon, color, placeholder, value }) => (
                        <Card key={name} className="border-border/50">
                            <CardHeader className="pb-1.5 pt-3 px-3">
                                <CardTitle className="text-xs flex items-center gap-2">
                                    <Icon className={cn("h-3.5 w-3.5", color)} /> {label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3">
                                {isEditing ? (
                                    <Textarea name={name} defaultValue={value || ""} placeholder={placeholder} className="min-h-[80px] text-xs" />
                                ) : (
                                    <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">
                                        {value || "Sin definir"}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </form>
        </div>
    );
}
