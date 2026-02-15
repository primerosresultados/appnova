"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Calendar, CheckCircle2, Circle, Clock, Search, User, Archive,
    Image, Film, BookImage, LayoutGrid, Radio, Mail, PenLine,
    FolderOpen, ChevronRight, Layers
} from "lucide-react";
import Link from "next/link";
import { ProjectActions } from "@/components/projects/ProjectActions";
import { NewProjectSheet } from "@/components/projects/NewProjectSheet";
import { cn } from "@/lib/utils";

const statusMap: Record<string, { label: string; color: string; dotColor: string; icon: any }> = {
    ACTIVE: { label: "Activo", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400", dotColor: "bg-emerald-500", icon: CheckCircle2 },
    ALERT: { label: "Alerta", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400", dotColor: "bg-amber-500", icon: Clock },
    CANCELLED: { label: "Cancelado", color: "text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400", dotColor: "bg-red-500", icon: Circle },
    ARCHIVED: { label: "Archivado", color: "text-gray-500 bg-gray-50 dark:bg-gray-500/10 dark:text-gray-400", dotColor: "bg-gray-400", icon: Archive },
};

const contentTypes = [
    { key: "graficas", icon: Image, label: "Gráficas", color: "text-pink-500" },
    { key: "reels", icon: Film, label: "Reels", color: "text-violet-500" },
    { key: "historias", icon: BookImage, label: "Historias", color: "text-amber-500" },
    { key: "carruseles", icon: LayoutGrid, label: "Carruseles", color: "text-cyan-500" },
    { key: "lives", icon: Radio, label: "Lives", color: "text-red-500" },
    { key: "mailings", icon: Mail, label: "Mailings", color: "text-emerald-500" },
    { key: "postSeos", icon: PenLine, label: "Posts SEO", color: "text-blue-500" },
] as const;

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    dueDate: Date | null;
    client: { id: string; name: string };
    _count: { tasks: number };
    graficas?: number;
    reels?: number;
    historias?: number;
    carruseles?: number;
    lives?: number;
    mailings?: number;
    postSeos?: number;
    actionLogs?: {
        content: string;
        createdAt: Date;
        user: { name: string | null } | null;
    }[];
}

interface ProjectsListClientProps {
    projects: Project[];
    archivedProjects: Project[];
}

export function ProjectsListClient({ projects, archivedProjects }: ProjectsListClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

    const currentProjects = activeTab === "active" ? projects : archivedProjects;

    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return currentProjects;
        const query = searchQuery.toLowerCase().trim();
        return currentProjects.filter((project) =>
            project.name.toLowerCase().includes(query) ||
            project.client.name.toLowerCase().includes(query) ||
            (project.description && project.description.toLowerCase().includes(query))
        );
    }, [currentProjects, searchQuery]);

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500 w-full max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Gestiona y rastrea el progreso de todos los proyectos.
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 md:flex-none">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar proyectos..."
                            className="pl-9 bg-background/50 backdrop-blur-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {activeTab === "active" && <NewProjectSheet />}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border/50">
                <button
                    onClick={() => { setActiveTab("active"); setSearchQuery(""); }}
                    className={cn(
                        "px-4 py-2.5 text-sm font-medium transition-all relative",
                        activeTab === "active" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                    )}
                >
                    Activos
                    <span className="ml-1.5 text-xs text-muted-foreground">({projects.length})</span>
                    {activeTab === "active" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />}
                </button>
                <button
                    onClick={() => { setActiveTab("archived"); setSearchQuery(""); }}
                    className={cn(
                        "px-4 py-2.5 text-sm font-medium transition-all relative flex items-center gap-1.5",
                        activeTab === "archived" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                    )}
                >
                    <Archive className="h-3.5 w-3.5" />
                    Archivados
                    {archivedProjects.length > 0 && (
                        <span className="ml-1 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                            {archivedProjects.length}
                        </span>
                    )}
                    {activeTab === "archived" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />}
                </button>
            </div>

            {/* Project List */}
            {filteredProjects.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-xl bg-muted/5">
                    {activeTab === "archived" ? (
                        <>
                            <Archive className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No hay proyectos archivados</h3>
                            <p className="text-sm text-muted-foreground mt-1">Los proyectos archivados aparecerán aquí.</p>
                        </>
                    ) : currentProjects.length === 0 ? (
                        <>
                            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No hay proyectos activos</h3>
                            <p className="text-sm text-muted-foreground mb-4">Crea tu primer proyecto para comenzar.</p>
                            <NewProjectSheet />
                        </>
                    ) : (
                        <>
                            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No se encontraron resultados</h3>
                            <p className="text-sm text-muted-foreground mt-1">Intenta con otro término de búsqueda.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => {
                        const status = statusMap[project.status] || statusMap.ACTIVE;
                        const isArchived = activeTab === "archived";
                        const activeContent = contentTypes.filter(ct => ((project as any)[ct.key] || 0) > 0);

                        return (
                            <div
                                key={project.id}
                                className={cn(
                                    "group relative rounded-xl border bg-card overflow-hidden transition-all duration-300",
                                    "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5",
                                    isArchived && "opacity-60 hover:opacity-80"
                                )}
                            >
                                {/* Accent top bar */}
                                <div className={cn("h-1", status.dotColor)} />

                                <div className="p-4 space-y-3">
                                    {/* Header row */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/projects/${project.id}`} className="group/link flex items-center gap-1.5">
                                                <h3 className="text-base font-bold truncate group-hover/link:text-primary transition-colors">
                                                    {project.name}
                                                </h3>
                                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover/link:text-primary group-hover/link:translate-x-0.5 transition-all shrink-0" />
                                            </Link>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <User className="h-3 w-3 text-muted-foreground/60" />
                                                <span className="text-xs text-muted-foreground font-medium">{project.client.name}</span>
                                            </div>
                                        </div>
                                        <ProjectActions projectId={project.id} project={project} isArchived={isArchived} />
                                    </div>

                                    {/* Description */}
                                    {project.description && (
                                        <p className="text-xs text-muted-foreground/80 line-clamp-1">
                                            {project.description}
                                        </p>
                                    )}

                                    {/* Content type chips */}
                                    {activeContent.length > 0 && (
                                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                                            {activeContent.map((ct) => {
                                                const Icon = ct.icon;
                                                const count = (project as any)[ct.key];
                                                return (
                                                    <div
                                                        key={ct.key}
                                                        className={cn(
                                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                                                            "bg-muted/50 border border-border/30",
                                                            ct.color
                                                        )}
                                                        title={ct.label}
                                                    >
                                                        <Icon className="h-2.5 w-2.5" />
                                                        <span>{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                                        <Badge
                                            variant="secondary"
                                            className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border-0", status.color)}
                                        >
                                            {status.label}
                                        </Badge>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {project.dueDate && (
                                                <div className="flex items-center gap-1" title="Fecha de entrega">
                                                    <Calendar className="h-3 w-3 opacity-60" />
                                                    <span>{format(new Date(project.dueDate), 'd MMM')}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1" title="Tareas">
                                                <Layers className="h-3 w-3 opacity-60" />
                                                <span>{project._count.tasks}</span>
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
