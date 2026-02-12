"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle2, Circle, Clock, Search, Bell, User } from "lucide-react";
import Link from "next/link";
import { ProjectActions } from "@/components/projects/ProjectActions";
import { NewProjectSheet } from "@/components/projects/NewProjectSheet";

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    PLANNING: { label: "Planificación", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Circle },
    IN_PROGRESS: { label: "En Progreso", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
    REVIEW: { label: "Revisión", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: CheckCircle2 },
    COMPLETED: { label: "Completado", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    ON_HOLD: { label: "En Pausa", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Circle },
};

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    dueDate: Date | null;
    client: {
        id: string;
        name: string;
    };
    _count: {
        tasks: number;
    };
    actionLogs?: {
        content: string;
        createdAt: Date;
        user: { name: string | null } | null;
    }[];
}

interface ProjectsListClientProps {
    projects: Project[];
}


export function ProjectsListClient({ projects }: ProjectsListClientProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) {
            return projects;
        }

        const query = searchQuery.toLowerCase().trim();
        return projects.filter((project) => {
            return (
                project.name.toLowerCase().includes(query) ||
                project.client.name.toLowerCase().includes(query) ||
                (project.description && project.description.toLowerCase().includes(query))
            );
        });
    }, [projects, searchQuery]);

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in-50 duration-500 w-full max-w-[100vw] overflow-x-hidden px-1">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Gestiona y rastrea el progreso de todos los proyectos.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 md:flex-none">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar proyectos..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <NewProjectSheet />
                </div>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                    {projects.length === 0 ? (
                        <>
                            <h3 className="text-lg font-medium">No hay proyectos activos</h3>
                            <p className="text-muted-foreground mb-4">Crea tu primer proyecto para comenzar.</p>
                            <NewProjectSheet />
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-medium">No se encontraron resultados</h3>
                            <p className="text-muted-foreground">Intenta con otro término de búsqueda.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredProjects.map((project) => {
                        const status = statusMap[project.status] || statusMap.PLANNING;
                        const StatusIcon = status.icon;
                        const latestLog = project.actionLogs?.[0]; // Get the latest log

                        return (
                            <div key={project.id} className="group border-b border-border/40 last:border-0 md:border md:rounded-xl md:bg-card md:backdrop-blur-sm md:border-border/50 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md">
                                <div className="p-3 md:p-4 flex flex-col gap-2 md:gap-3">
                                    {/* Header: Name and Actions */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Link href={`/projects/${project.id}`} className="block group-hover:text-primary transition-colors">
                                                    <h3 className="text-base md:text-lg font-bold leading-tight truncate">
                                                        {project.name}
                                                    </h3>
                                                </Link>
                                                {/* Notification Bell */}
                                                {latestLog && (
                                                    <div className="relative group/bell">
                                                        <div className="bg-red-500/10 text-red-500 p-1 rounded-full animate-pulse md:animate-none md:hover:animate-pulse cursor-help">
                                                            <Bell className="h-3 w-3" />
                                                            <span className="absolute top-0 right-0 h-1.5 w-1.5 bg-red-500 rounded-full border-2 border-background"></span>
                                                        </div>
                                                        {/* Tooltip for Bell */}
                                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover/bell:block bg-popover text-popover-foreground text-xs p-2 rounded border shadow-lg w-64 z-10">
                                                            <p className="font-semibold mb-1">Última actividad:</p>
                                                            <p className="line-clamp-2">{latestLog.content}</p>
                                                            <p className="text-muted-foreground mt-1 text-[10px]">{format(new Date(latestLog.createdAt), 'd MMM HH:mm')} por {latestLog.user?.name || 'Sistema'}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Mobile Status Dot */}
                                                <div className={`md:hidden h-2.5 w-2.5 rounded-full ${status.color.split(' ')[1] ? status.color.split(' ')[1].replace('text-', 'bg-') : 'bg-gray-500'}`} />
                                            </div>

                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground truncate">
                                                    <User className="h-3 w-3 opacity-70" />
                                                    <span className="font-medium">{project.client.name}</span>
                                                </div>

                                                {/* Latest Change Text (Visible directly) */}
                                                {latestLog && (
                                                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground/80 mt-1 bg-muted/30 p-1 rounded w-fit max-w-full">
                                                        <Bell className="h-2.5 w-2.5 text-primary/70 shrink-0" />
                                                        <span className="font-medium text-primary/90 shrink-0">Últimos:</span>
                                                        <span className="truncate">{latestLog.content}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="md:hidden">
                                                {project.dueDate && (
                                                    <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded mr-2">
                                                        {format(new Date(project.dueDate!), 'd MMM')}
                                                    </span>
                                                )}
                                            </div>
                                            <ProjectActions projectId={project.id} />
                                        </div>
                                    </div>

                                    {/* Desktop: Horizontal Layout (Hidden on Mobile) */}
                                    <div className="hidden md:flex items-center justify-between mt-0 pt-2 border-t border-border/40">
                                        <div className="text-sm text-muted-foreground truncate max-w-[40%] flex items-center gap-2">
                                            {project.description ? (
                                                <span>{project.description}</span>
                                            ) : (
                                                <span className="italic opacity-50">Sin descripción</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <Badge variant="outline" className={`${status.color} border font-medium px-2.5 py-0.5 text-xs`}>
                                                <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                                                {status.label}
                                            </Badge>
                                            {project.dueDate && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Fecha de entrega">
                                                    <Calendar className="h-4 w-4 opacity-70" />
                                                    <span>{format(new Date(project.dueDate), 'd MMM')}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CheckCircle2 className="h-4 w-4 opacity-70" />
                                                <span>{project._count.tasks} Tareas</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

