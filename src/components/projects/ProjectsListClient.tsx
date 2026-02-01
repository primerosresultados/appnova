"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle2, Circle, Clock, Search } from "lucide-react";
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
        <div className="space-y-4 md:space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Gestiona y rastrea el progreso de todos los proyectos.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
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

                        return (
                            <Card key={project.id} className="bg-card backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors group">
                                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                                    {/* Main Info (Left) */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/projects/${project.id}`} className="block group-hover:underline decoration-primary underline-offset-4">
                                            <h3 className="text-xl font-bold leading-none tracking-tight truncate mb-1.5">
                                                {project.name}
                                            </h3>
                                        </Link>
                                        <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                                            <span className="font-medium text-foreground">{project.client.name}</span>
                                            {project.description && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                    <span className="truncate opacity-80">{project.description}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metadata & Actions (Right) */}
                                    <div className="flex flex-wrap items-center gap-3 md:gap-6 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
                                        {/* Status Badge */}
                                        <Badge variant="outline" className={`${status.color} border font-medium px-2.5 py-0.5`}>
                                            <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                                            {status.label}
                                        </Badge>

                                        {/* Deadline Indicator */}
                                        <div className="flex items-center gap-2 text-sm" title="Fecha de entrega">
                                            <Calendar className={`h-4 w-4 ${!project.dueDate ? 'text-slate-500' : 'text-slate-400'}`} />
                                            <span className={!project.dueDate ? 'text-muted-foreground' : ''}>
                                                {project.dueDate ? format(new Date(project.dueDate), 'd MMM') : 'Sin fecha'}
                                            </span>
                                        </div>

                                        {/* Task Count */}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Tareas totales">
                                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-secondary/50 text-xs font-bold">
                                                {project._count.tasks}
                                            </div>
                                            <span className="hidden md:inline">Tareas</span>
                                        </div>

                                        <div className="pl-2 border-l border-border/40">
                                            <ProjectActions projectId={project.id} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
