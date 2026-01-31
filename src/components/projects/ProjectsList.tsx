import { db } from "@/lib/db";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
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

async function getProjects() {
    try {
        const projects = await db.project.findMany({
            orderBy: { updatedAt: "desc" },
            include: {
                client: true,
                _count: {
                    select: { tasks: true }
                }
            }
        });
        return projects;
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

export async function ProjectsList() {
    const projects = await getProjects();

    if (projects.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed rounded-lg">
                <h3 className="text-lg font-medium">No hay proyectos activos</h3>
                <p className="text-muted-foreground mb-4">Crea tu primer proyecto para comenzar.</p>
                <NewProjectSheet />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {projects.map((project) => {
                const status = statusMap[project.status] || statusMap.PLANNING;
                const StatusIcon = status.icon;

                return (
                    <Card key={project.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors group">
                        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                            {/* Status Badge */}
                            <div className="min-w-[140px]">
                                <Badge variant="outline" className={`${status.color} w-fit`}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {status.label}
                                </Badge>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <Link href={`/projects/${project.id}`} className="block group-hover:underline decoration-primary underline-offset-4">
                                    <h3 className="text-lg font-semibold leading-none tracking-tight truncate">
                                        {project.name}
                                    </h3>
                                </Link>
                                <div className="text-sm text-muted-foreground mt-1 truncate">
                                    <span className="font-medium text-foreground">{project.client.name}</span>
                                    {project.description && <span className="mx-2">•</span>}
                                    {project.description}
                                </div>
                            </div>

                            {/* Metadata & Actions */}
                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                                {/* Progress (simplified) */}
                                <div className="hidden md:block w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[35%] rounded-full" />
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span className="hidden md:inline">{project.dueDate ? format(new Date(project.dueDate), 'MMM d') : 'Sin fecha'}</span>
                                        <span className="md:hidden">{project.dueDate ? format(new Date(project.dueDate), 'dd/MM') : '-'}</span>
                                    </div>
                                    <div className="whitespace-nowrap">
                                        {project._count.tasks} Tareas
                                    </div>
                                </div>

                                <ProjectActions projectId={project.id} />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
