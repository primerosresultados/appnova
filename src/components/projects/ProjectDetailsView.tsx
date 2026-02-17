"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, Circle, ListTodo, Workflow, FileText, Database, User, Brain, ChevronLeft, ChevronRight, Target, TrendingUp, Image, Film, BookImage, LayoutGrid, Radio, Mail, PenLine, BarChart3, LayoutDashboard, UserCircle, Package } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, ReactNode, useCallback } from "react";
import { EditProjectDialog } from "./EditProjectDialog";

interface ProjectDetailsViewProps {
    project: any; // Core project data
    currentUser?: any;

    // Slots for Streaming Content
    dashboardSlot?: ReactNode;
    tasksSlot?: ReactNode;
    planningSlot?: ReactNode;
    resourcesSlot?: ReactNode;
    creativitySlot?: ReactNode;
    competitorsSlot?: ReactNode;
    adsSlot?: ReactNode;
    contentSlot?: ReactNode;
    workflowsSlot?: ReactNode;
    conversionsSlot?: ReactNode;
    buyerPersonaSlot?: ReactNode;
    ofertaSlot?: ReactNode;
    actionLogSlot?: ReactNode;
}


const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    ACTIVE: { label: "Activo", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    ALERT: { label: "Alerta", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Circle },
    CANCELLED: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: Circle },
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
    dashboardSlot,
    tasksSlot,
    planningSlot,
    resourcesSlot,
    creativitySlot,
    competitorsSlot,
    adsSlot,
    contentSlot,
    workflowsSlot,
    conversionsSlot,
    buyerPersonaSlot,
    ofertaSlot,
    actionLogSlot
}: ProjectDetailsViewProps) {

    const status = statusMap[project.status] || statusMap.ACTIVE;
    const StatusIcon = status.icon;
    const isClient = currentUser?.role === 'CLIENTE';
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("tasks");
    const [isEditOpen, setIsEditOpen] = useState(false);
    // Track which tabs have been visited so we mount them lazily but keep them alive
    const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["tasks"]));

    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value);
        setVisitedTabs(prev => {
            if (prev.has(value)) return prev;
            const next = new Set(prev);
            next.add(value);
            return next;
        });
    }, []);

    // Content type config for display — keys match Project schema fields
    const contentTypeConfig: { key: string; label: string; icon: any; color: string }[] = [
        { key: "graficas", label: "Gráficas", icon: Image, color: "text-pink-500 bg-pink-500/10" },
        { key: "reels", label: "Reels", icon: Film, color: "text-purple-500 bg-purple-500/10" },
        { key: "historias", label: "Historias", icon: BookImage, color: "text-orange-500 bg-orange-500/10" },
        { key: "carruseles", label: "Carruseles", icon: LayoutGrid, color: "text-blue-500 bg-blue-500/10" },
        { key: "lives", label: "Lives", icon: Radio, color: "text-red-500 bg-red-500/10" },
        { key: "mailings", label: "Mailing", icon: Mail, color: "text-cyan-500 bg-cyan-500/10" },
        { key: "postSeos", label: "Post SEO", icon: PenLine, color: "text-emerald-500 bg-emerald-500/10" },
    ];

    const hasContentCounts = contentTypeConfig.some(({ key }) => (project[key] || 0) > 0);

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
                    {!isClient && (
                        <Button variant="outline" className="w-full md:w-auto ml-0 md:ml-0" onClick={() => setIsEditOpen(true)}>
                            Editar Proyecto
                        </Button>
                    )}
                </div>

                {!isClient && <EditProjectDialog project={project} open={isEditOpen} onOpenChange={setIsEditOpen} />}

                {!isClient && hasContentCounts && (
                    <div className="flex flex-wrap gap-2">
                        {contentTypeConfig.map(({ key, label, icon: Icon, color }) => {
                            const count = project[key] || 0;
                            if (count === 0) return null;
                            return (
                                <div
                                    key={key}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color} border border-current/10`}
                                >
                                    <Icon className="h-3 w-3" />
                                    <span className="font-bold">{count}</span>
                                    <span className="opacity-80">{label}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Tabs defaultValue="dashboard" className="w-full" value={activeTab} onValueChange={handleTabChange}>
                    <div className="border-b border-border/40 mb-6">
                        <TabsList className="w-full flex justify-start bg-transparent p-0 gap-2 overflow-x-auto overflow-y-hidden max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2">
                            <TabsTrigger value="dashboard" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="conversions" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <BarChart3 className="h-4 w-4" /> Conversiones
                            </TabsTrigger>
                            {!isClient && (
                                <TabsTrigger value="resources" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                    <Database className="h-4 w-4" /> Recursos
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="planning" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <CalendarIcon className="h-4 w-4" /> Planificación
                            </TabsTrigger>
                            <TabsTrigger value="tasks" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <ListTodo className="h-4 w-4" /> Tareas
                            </TabsTrigger>
                            <TabsTrigger value="creativity" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <Brain className="h-4 w-4" /> Creatividad
                            </TabsTrigger>
                            <TabsTrigger value="competitors" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <Target className="h-4 w-4" /> Competencia
                            </TabsTrigger>
                            <TabsTrigger value="ads" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <TrendingUp className="h-4 w-4" /> Ads
                            </TabsTrigger>
                            <TabsTrigger value="content" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <FileText className="h-4 w-4" /> Contenido
                            </TabsTrigger>
                            <TabsTrigger value="workflows" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <Workflow className="h-4 w-4" /> Flujos
                            </TabsTrigger>
                            <TabsTrigger value="buyerPersona" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <UserCircle className="h-4 w-4" /> Buyer Persona
                            </TabsTrigger>
                            <TabsTrigger value="oferta" className="rounded-full border border-transparent px-4 py-2 gap-2 font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all flex items-center whitespace-nowrap">
                                <Package className="h-4 w-4" /> Oferta
                            </TabsTrigger>
                        </TabsList>
                    </div>


                    <TabsContent value="dashboard" className="space-y-4" forceMount hidden={activeTab !== "dashboard"}>
                        {dashboardSlot}
                    </TabsContent>

                    <TabsContent value="tasks" className="space-y-4" forceMount hidden={activeTab !== "tasks"}>
                        {tasksSlot}
                    </TabsContent>

                    <TabsContent value="planning" className="w-full h-full" forceMount={visitedTabs.has("planning") || undefined} hidden={activeTab !== "planning"}>
                        {visitedTabs.has("planning") && planningSlot}
                    </TabsContent>

                    <TabsContent value="resources" className="space-y-4" forceMount={visitedTabs.has("resources") || undefined} hidden={activeTab !== "resources"}>
                        {visitedTabs.has("resources") && resourcesSlot}
                    </TabsContent>

                    <TabsContent value="creativity" className="space-y-4" forceMount={visitedTabs.has("creativity") || undefined} hidden={activeTab !== "creativity"}>
                        {visitedTabs.has("creativity") && creativitySlot}
                    </TabsContent>

                    <TabsContent value="competitors" className="space-y-4" forceMount={visitedTabs.has("competitors") || undefined} hidden={activeTab !== "competitors"}>
                        {visitedTabs.has("competitors") && competitorsSlot}
                    </TabsContent>

                    <TabsContent value="ads" className="space-y-4" forceMount={visitedTabs.has("ads") || undefined} hidden={activeTab !== "ads"}>
                        {visitedTabs.has("ads") && adsSlot}
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4" forceMount={visitedTabs.has("content") || undefined} hidden={activeTab !== "content"}>
                        {visitedTabs.has("content") && contentSlot}
                    </TabsContent>

                    <TabsContent value="workflows" className="space-y-4" forceMount={visitedTabs.has("workflows") || undefined} hidden={activeTab !== "workflows"}>
                        {visitedTabs.has("workflows") && workflowsSlot}
                    </TabsContent>

                    <TabsContent value="conversions" className="space-y-4" forceMount={visitedTabs.has("conversions") || undefined} hidden={activeTab !== "conversions"}>
                        {visitedTabs.has("conversions") && conversionsSlot}
                    </TabsContent>

                    <TabsContent value="buyerPersona" className="space-y-4" forceMount={visitedTabs.has("buyerPersona") || undefined} hidden={activeTab !== "buyerPersona"}>
                        {visitedTabs.has("buyerPersona") && buyerPersonaSlot}
                    </TabsContent>

                    <TabsContent value="oferta" className="space-y-4" forceMount={visitedTabs.has("oferta") || undefined} hidden={activeTab !== "oferta"}>
                        {visitedTabs.has("oferta") && ofertaSlot}
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

            <div className="h-full hidden xl:block border-l border-border overflow-hidden">
                {actionLogSlot}
            </div>
        </div>
    );
}
