import { db } from "@/lib/db";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, CheckCircle2, Circle, Clock, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewProjectSheet } from "@/components/projects/NewProjectSheet";

async function getProjects() {
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
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    PLANNING: { label: "Planificación", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Circle },
    IN_PROGRESS: { label: "En Progreso", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
    REVIEW: { label: "Revisión", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: CheckCircle2 }, // Using check circle as placeholder
    COMPLETED: { label: "Completado", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    ON_HOLD: { label: "En Pausa", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Circle },
};

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-muted-foreground">Gestiona y rastrea el progreso de todos los proyectos.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar proyectos..."
                            className="pl-9"
                        />
                    </div>
                    <NewProjectSheet />
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {projects.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-lg">
                        <h3 className="text-lg font-medium">No hay proyectos activos</h3>
                        <p className="text-muted-foreground mb-4">Crea tu primer proyecto para comenzar.</p>
                        <NewProjectSheet />
                    </div>
                ) : (
                    projects.map((project) => {
                        const status = statusMap[project.status] || statusMap.PLANNING;
                        const StatusIcon = status.icon;

                        return (
                            <Card key={project.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors group">
                                <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                                    {/* Status Badge - Left on mobile, start of row on desktop */}
                                    <div className="min-w-[140px]">
                                        <Badge variant="outline" className={`${status.color} w-fit`}>
                                            <StatusIcon className="mr-1 h-3 w-3" />
                                            {status.label}
                                        </Badge>
                                    </div>

                                    {/* Main Info - Grows to fill space */}
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

                                    {/* Metadata & Actions - Right side */}
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

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/projects/${project.id}`}>Ver Detalles</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
