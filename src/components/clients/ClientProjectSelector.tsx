import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FolderKanban, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getClientProjects } from "@/app/actions/client-actions";
import { Badge } from "@/components/ui/badge";

interface Project {
    id: string;
    name: string;
    status: string;
    client: {
        name: string;
    }
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    PLANNING: { label: "Planificación", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Circle },
    IN_PROGRESS: { label: "En Progreso", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Circle },
    REVIEW: { label: "Revisión", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: CheckCircle2 },
    COMPLETED: { label: "Completado", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    ON_HOLD: { label: "En Pausa", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Circle },
};

export function ClientProjectSelector() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const router = useRouter();
    const params = useParams(); // Use params to get current project ID

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const result = await getClientProjects();
                if (result.success && result.data) {
                    setProjects(result.data as any);

                    // Sync with URL params
                    if (params?.id) {
                        const current = result.data.find((p: any) => p.id === params.id);
                        if (current) setSelectedProject(current as any);
                    } else if (result.data.length === 1) {
                        setSelectedProject(result.data[0] as any);
                    }
                }
            } catch (error) {
                console.error("Failed to load projects", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [params?.id]); // Re-run when ID changes

    const handleSelect = (project: Project) => {
        setSelectedProject(project);
        router.push(`/projects/${project.id}`);
    };

    if (loading) return null;
    if (projects.length === 0) return null;

    const status = selectedProject ? statusMap[selectedProject.status] || statusMap.PLANNING : statusMap.PLANNING;
    const StatusIcon = status.icon;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-4 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors border border-transparent hover:border-border/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-lg leading-none">{selectedProject ? selectedProject.name : "Seleccionar Proyecto"}</h2>
                            {selectedProject && (
                                <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${status.color} border-0 bg-transparent`}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {status.label}
                                </Badge>
                            )}
                            <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
                        </div>
                        {selectedProject && (
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                {selectedProject.client.name}
                            </p>
                        )}
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
                {projects.map((project) => {
                    const pStatus = statusMap[project.status] || statusMap.PLANNING;
                    return (
                        <DropdownMenuItem
                            key={project.id}
                            onClick={() => handleSelect(project)}
                            className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="font-medium">{project.name}</span>
                                <Badge variant="outline" className={`text-[10px] h-4 ${pStatus.color} bg-transparent border-0`}>
                                    {pStatus.label}
                                </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {project.client.name}
                            </span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
