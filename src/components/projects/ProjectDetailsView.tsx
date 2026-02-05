"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, Circle, ListTodo, Workflow, FileText, Database, User, Brain, ChevronLeft, ChevronRight, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, ReactNode } from "react";

interface ProjectDetailsViewProps {
    project: any; // Core project data
    currentUser?: any;

    // Slots for Streaming Content
    tasksSlot?: ReactNode;
    planningSlot?: ReactNode;
    resourcesSlot?: ReactNode;
    creativitySlot?: ReactNode;
    competitorsSlot?: ReactNode;
    adsSlot?: ReactNode;
    contentSlot?: ReactNode;
    workflowsSlot?: ReactNode;
    actionLogSlot?: ReactNode;
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

// Expanded Description Box


export function ProjectDetailsView({
    project,
    currentUser,
    tasksSlot,
    planningSlot,
    resourcesSlot,
    creativitySlot,
    competitorsSlot,
    adsSlot,
    contentSlot,
    workflowsSlot,
    actionLogSlot
}: ProjectDetailsViewProps) {

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
                                <div className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                    <Link
                                        href={`/clients/${project.client.id}`}
                                        className="flex items-center gap-1.5 hover:text-primary hover:underline transition-colors"
                                    >
                                        <User className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{project.client.name}</span>
                                    </Link>
                                </div>
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
                        <TabsTrigger value="competitors" className="rounded-lg border-0 px-4 py-2 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <Target className="h-4 w-4" /> Competencia
                        </TabsTrigger>
                        <TabsTrigger value="ads" className="rounded-lg border-0 px-4 py-2 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <TrendingUp className="h-4 w-4" /> Ads
                        </TabsTrigger>
                        <TabsTrigger value="content" className="rounded-lg border-0 px-4 py-2 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <FileText className="h-4 w-4" /> Contenido
                        </TabsTrigger>
                        <TabsTrigger value="workflows" className="rounded-lg border-0 px-4 py-2 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                            <Workflow className="h-4 w-4" /> Flujos de Trabajo
                        </TabsTrigger>
                    </TabsList>


                    <TabsContent value="tasks" className="space-y-4">
                        {tasksSlot}
                    </TabsContent>

                    <TabsContent value="planning" className="w-full h-full">
                        {planningSlot}
                    </TabsContent>

                    <TabsContent value="resources" className="space-y-4">
                        {resourcesSlot}
                    </TabsContent>

                    <TabsContent value="creativity" className="space-y-4">
                        {creativitySlot}
                    </TabsContent>

                    <TabsContent value="competitors" className="space-y-4">
                        {competitorsSlot}
                    </TabsContent>

                    <TabsContent value="ads" className="space-y-4">
                        {adsSlot}
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                        {contentSlot}
                    </TabsContent>

                    <TabsContent value="workflows" className="space-y-4">
                        {workflowsSlot}
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
                    {actionLogSlot}
                </div>
            </div>

            <div className="h-full hidden xl:block border-l border-border">
                {actionLogSlot}
            </div>
        </div>
    );
}
