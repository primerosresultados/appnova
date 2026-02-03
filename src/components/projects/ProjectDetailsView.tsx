"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, Circle, ListTodo, Workflow, FileText, LayoutDashboard, Database, User, Link as LinkIcon, ChevronDown, ChevronUp, Brain, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ActionLogPanel } from "@/components/projects/ActionLogPanel";
import { TaskStatusSelect } from "@/components/tasks/TaskStatusSelect";
import { ProjectCalendar } from "@/components/projects/ProjectCalendar";
import { NewTaskSheet } from "@/components/projects/NewTaskSheet";
import { ResourcesTab } from "@/components/projects/ResourcesTab";
import { ContentsTab } from "@/components/projects/ContentsTab";
import { WorkflowsTab } from "@/components/projects/WorkflowsTab";
import { CreativitiesTab } from "@/components/projects/CreativitiesTab";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { format } from "date-fns";

// Types need to be defined or imported
// For simplicity, defining here based on usage, but ideally should be shared
interface ProjectDetailsViewProps {
    project: any;
    allWorkflows?: any[];
    currentUser?: any;
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

export function ProjectDetailsView({ project, allWorkflows = [], currentUser }: ProjectDetailsViewProps) {

    const status = statusMap[project.status] || statusMap.PLANNING;
    const StatusIcon = status.icon;
    const isClient = currentUser?.role === 'CLIENTE';
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_350px] h-[calc(100vh-4rem)] w-full gap-0 overflow-hidden">
            <div className="h-full overflow-y-auto space-y-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-start gap-3 w-full">
                        <Link href={isClient ? "/dashboard" : "/projects"}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        {!isClient && (
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight break-words">{project.name}</h1>
                                    <Badge variant="outline" className={`${status.color} whitespace-nowrap`}>
                                        <StatusIcon className="mr-1 h-3 w-3" />
                                        {status.label}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground text-sm flex items-center gap-2">
                                    <User className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{project.client.name}</span>
                                </p>
                            </div>
                        )}
                        {isClient && <div className="flex-1" />}
                    </div>
                    {!isClient && <Button variant="outline" className="w-full md:w-auto ml-0 md:ml-0">Editar Proyecto</Button>}
                </div>

                <Tabs defaultValue="tasks" className="w-full">
                    <TabsList className="w-full flex justify-start bg-muted border-b-0 rounded-xl h-auto p-1 mb-6 gap-1 flex-nowrap overflow-x-auto overflow-y-hidden max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <TabsTrigger value="tasks" className="rounded-lg border-0 px-4 py-2 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <ListTodo className="h-4 w-4" /> Tareas Pendientes
                        </TabsTrigger>
                        <TabsTrigger value="planning" className="rounded-lg border-0 px-4 py-2 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <CalendarIcon className="h-4 w-4" /> Planificación
                        </TabsTrigger>
                        {!isClient && (
                            <TabsTrigger value="resources" className="rounded-lg border-0 px-4 py-2 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                                <Database className="h-4 w-4" /> Recursos
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="creativity" className="rounded-lg border-0 px-4 py-2 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <Brain className="h-4 w-4" /> Creatividades
                        </TabsTrigger>
                        <TabsTrigger value="content" className="rounded-lg border-0 px-4 py-2 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <FileText className="h-4 w-4" /> Contenido
                        </TabsTrigger>
                        <TabsTrigger value="workflows" className="rounded-lg border-0 px-4 py-2 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <Workflow className="h-4 w-4" /> Flujos de Trabajo
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="space-y-4">
                        {project.tasks.length === 0 ? (
                            <div className="text-center py-12 border border-dashed rounded-lg bg-card">
                                <ListTodo className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">No hay tareas pendientes</h3>
                                <p className="text-muted-foreground mb-4">Todas las tareas están al día.</p>
                                {!isClient && <NewTaskSheet projectId={project.id} />}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {!isClient && (
                                    <div className="flex justify-end">
                                        <NewTaskSheet projectId={project.id} />
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    {project.tasks.map((task: any) => (
                                        <Link key={task.id} href={`/tasks/${task.id}`}>
                                            <div className="flex flex-col gap-2 p-4 rounded-lg border border-border/50 bg-card hover:bg-card transition-colors cursor-pointer group">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-0">
                                                    <div className="flex items-start gap-3 w-full">
                                                        <div className={`p-2 rounded-full mt-0.5 shrink-0 ${task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                                            {task.status === 'DONE' ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className={`font-medium leading-snug ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'group-hover:text-primary transition-colors'}`}>{task.title}</h4>
                                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
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
                                                    <div className="flex items-center gap-2 ml-11 md:ml-0 self-start">
                                                        <Badge variant="outline" className={priorityMap[task.priority]?.color}>
                                                            {priorityMap[task.priority]?.label}
                                                        </Badge>
                                                        <TaskStatusSelect taskId={task.id} status={task.status} variant="minimal" />
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
                                isClient={isClient}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="resources" className="space-y-4">
                        <ResourcesTab projectId={project.id} resources={project.resources || []} />
                    </TabsContent>

                    <TabsContent value="creativity" className="space-y-4">
                        <CreativitiesTab projectId={project.id} resources={project.resources || []} currentUser={currentUser} />
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                        <ContentsTab projectId={project.id} contents={project.contents || []} isClient={isClient} />
                    </TabsContent>

                    <TabsContent value="workflows" className="space-y-4">
                        <WorkflowsTab projectId={project.id} projectWorkflows={project.workflows || []} availableWorkflows={allWorkflows} isClient={isClient} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Mobile Action Log Sidebar */}
            <div
                className="fixed top-16 bottom-0 z-50 flex items-center transition-[right] duration-300 xl:hidden"
                style={{ right: mobileSidebarOpen ? '0px' : '-350px' }}
            >
                <button
                    onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    className="w-8 h-12 bg-primary text-primary-foreground rounded-l-md flex items-center justify-center shadow-md border-y border-l border-primary-foreground/20"
                >
                    {mobileSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
                <div className="w-[350px] h-full bg-background border-l shadow-2xl overflow-hidden">
                    <ActionLogPanel projectId={project.id} logs={project.actionLogs} currentUser={currentUser} />
                </div>
            </div>

            <div className="h-full hidden xl:block border-l border-border">
                <ActionLogPanel projectId={project.id} logs={project.actionLogs} currentUser={currentUser} />
            </div>
        </div>
    );
}
