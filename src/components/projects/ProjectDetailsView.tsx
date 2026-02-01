"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, Circle, ListTodo, Workflow, FileText, LayoutDashboard, Database, User, Link as LinkIcon, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { ActionLogPanel } from "@/components/projects/ActionLogPanel";
import { ProjectCalendar } from "@/components/projects/ProjectCalendar";
import { NewTaskSheet } from "@/components/projects/NewTaskSheet";
import { ResourcesTab } from "@/components/projects/ResourcesTab";
import { ContentsTab } from "@/components/projects/ContentsTab";
import { WorkflowsTab } from "@/components/projects/WorkflowsTab";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { format } from "date-fns";

// Types need to be defined or imported
// For simplicity, defining here based on usage, but ideally should be shared
interface ProjectDetailsViewProps {
    project: any;
    allWorkflows?: any[];
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    PLANNING: { label: "Planificación", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Circle },
    IN_PROGRESS: { label: "En Progreso", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Circle },
    REVIEW: { label: "Revisión", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: CheckCircle2 },
    COMPLETED: { label: "Completado", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    ON_HOLD: { label: "En Pausa", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Circle },
};

const priorityMap: Record<string, { label: string; color: string }> = {
    LOW: { label: "Baja", color: "text-slate-500 bg-slate-500/10" },
    MEDIUM: { label: "Media", color: "text-amber-500 bg-amber-500/10" },
    HIGH: { label: "Alta", color: "text-red-500 bg-red-500/10" },
};

const taskStatusMap: Record<string, string> = {
    TODO: "Pendiente",
    IN_PROGRESS: "En Progreso",
    REVIEW: "Revisión",
    DONE: "Completado",
};

// Helper function to strip HTML tags
function stripHtml(html: string | null): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, '').trim();
}

// Expandable description component
function TaskDescriptionBox({ description }: { description: string | null }) {
    const [expanded, setExpanded] = useState(false);
    const cleanText = stripHtml(description);

    if (!cleanText) return null;

    const isLong = cleanText.length > 100;

    return (
        <div className="ml-11 mt-2 p-3 bg-accent/20 rounded-md text-sm border border-border/30">
            <p className={`text-muted-foreground text-xs ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
                {cleanText}
            </p>
            {isLong && (
                <button
                    onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
                    className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                >
                    {expanded ? (
                        <>Ver menos <ChevronUp className="h-3 w-3" /></>
                    ) : (
                        <>Ver más <ChevronDown className="h-3 w-3" /></>
                    )}
                </button>
            )}
        </div>
    );
}

export function ProjectDetailsView({ project, allWorkflows = [] }: ProjectDetailsViewProps) {

    const status = statusMap[project.status] || statusMap.PLANNING;
    const StatusIcon = status.icon;

    return (
        <div className="flex h-[calc(100vh-4rem)] -m-6 md:-m-8">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/projects">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                            <Badge variant="outline" className={status.color}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {status.label}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                            <User className="h-3 w-3" /> {project.client.name}
                        </p>
                    </div>
                    <Button variant="outline">Editar Proyecto</Button>
                </div>

                <Tabs defaultValue="tasks" className="w-full">
                    <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 mb-6 flex-wrap">
                        <TabsTrigger value="tasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 gap-2">
                            <ListTodo className="h-4 w-4" /> Tareas Pendientes
                        </TabsTrigger>
                        <TabsTrigger value="planning" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 gap-2">
                            <CalendarIcon className="h-4 w-4" /> Planificación
                        </TabsTrigger>
                        <TabsTrigger value="resources" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 gap-2">
                            <Database className="h-4 w-4" /> Recursos
                        </TabsTrigger>
                        <TabsTrigger value="content" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 gap-2">
                            <FileText className="h-4 w-4" /> Contenido
                        </TabsTrigger>
                        <TabsTrigger value="workflows" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 gap-2">
                            <Workflow className="h-4 w-4" /> Flujos de Trabajo
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="space-y-4">
                        {project.tasks.length === 0 ? (
                            <div className="text-center py-12 border border-dashed rounded-lg bg-card/30">
                                <ListTodo className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">No hay tareas pendientes</h3>
                                <p className="text-muted-foreground mb-4">Todas las tareas están al día.</p>
                                <NewTaskSheet projectId={project.id} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <NewTaskSheet projectId={project.id} />
                                </div>
                                <div className="grid gap-2">
                                    {project.tasks.map((task: any) => (
                                        <Link key={task.id} href={`/tasks/${task.id}`}>
                                            <div className="flex flex-col gap-2 p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors cursor-pointer group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                                            {task.status === 'DONE' ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-medium ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'group-hover:text-primary transition-colors'}`}>{task.title}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                {task.assignee ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <Avatar className="h-4 w-4">
                                                                            <AvatarFallback className="text-[9px]">{task.assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                        </Avatar>
                                                                        <span>{task.assignee.name}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> Sin asignar</span>
                                                                )}
                                                                <span>•</span>
                                                                <span>Vence: {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'Sin fecha'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={priorityMap[task.priority]?.color}>
                                                            {priorityMap[task.priority]?.label}
                                                        </Badge>
                                                        <Badge variant="secondary">
                                                            {taskStatusMap[task.status]}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {(task.description || task.links) && (
                                                    <TaskDescriptionBox description={task.description} />
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="planning" className="w-full h-full">
                        <div className="w-full h-full">
                            <ProjectCalendar
                                projectId={project.id}
                                milestones={project.milestones}
                                contents={project.contents || []}
                                tasks={project.tasks || []}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="resources" className="space-y-4">
                        <ResourcesTab projectId={project.id} resources={project.resources} />
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                        <ContentsTab projectId={project.id} contents={project.contents || []} />
                    </TabsContent>

                    <TabsContent value="workflows" className="space-y-4">
                        <WorkflowsTab projectId={project.id} projectWorkflows={project.workflows || []} availableWorkflows={allWorkflows} />
                    </TabsContent>
                </Tabs>
            </div>

            <div className="w-[350px] shrink-0 border-l border-border h-full hidden xl:block">
                <ActionLogPanel projectId={project.id} logs={project.actionLogs} />
            </div>
        </div>
    );
}
