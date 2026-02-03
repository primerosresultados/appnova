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
        <div className="space-y-4 md:space-y-6 animate-in fade-in-50 duration-500 max-w-full overflow-x-hidden p-1">
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

                        return (
                            <Card key={project.id} className="bg-card backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors group">
                                <CardContent className="p-3 md:p-4">
                                    <div className="flex flex-col gap-2 md:gap-4">
                                        {/* Header: Name and Actions */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/projects/${project.id}`} className="block group-hover:text-primary transition-colors">
                                                    <h3 className="text-lg font-bold leading-tight truncate">
                                                        {project.name}
                                                    </h3>
                                                </Link>
                                                <div className="text-sm text-muted-foreground mt-0.5 truncate">
                                                    {project.client.name}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="md:hidden">
                                                    <Badge variant="outline" className={`${status.color} border font-medium px-2 py-0.5 text-[10px]`}>
                                                        {status.label}
                                                    </Badge>
                                                </div>
                                                <ProjectActions projectId={project.id} />
                                            </div>
                                        </div>

                                        {/* Desktop: Horizontal Layout (Hidden on Mobile) */}
                                        <div className="hidden md:flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                                            <div className="text-sm text-muted-foreground truncate max-w-[40%]">
                                                {project.description}
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <Badge variant="outline" className={`${status.color} border font-medium px-2.5 py-0.5 text-xs`}>
                                                    <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                                                    {status.label}
                                                </Badge>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4 opacity-70" />
                                                    <span>{project.dueDate ? format(new Date(project.dueDate), 'd MMM') : 'Sin fecha'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <CheckCircle2 className="h-4 w-4 opacity-70" />
                                                    <span>{project._count.tasks} Tareas</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile: Metadata Row (Hidden on Desktop) */}
                                        <div className="flex md:hidden items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                    {project.dueDate ? format(new Date(project.dueDate), 'd MMM') : '-'}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                    {project._count.tasks}
                                                </div>
                                            </div>
                                            {project.description && (
                                                <div className="truncate max-w-[120px] opacity-70 italic text-[10px]">
                                                    {project.description}
                                                </div>
                                            )}
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
