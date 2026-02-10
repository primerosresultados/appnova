
import { notFound } from "next/navigation";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserSession } from "@/app/actions/auth-actions";
import { getProjectCore } from "@/app/projects/actions-fetchers";

// Import Tab Server Components
import TasksTab from "./tabs/TasksTab";
import PlanningTab from "./tabs/PlanningTab";
import ResourcesTab from "./tabs/ResourcesTab";
import CreativityTab from "./tabs/CreativityTab";
import CompetitorsTab from "./tabs/CompetitorsTab";
import AdsTab from "./tabs/AdsTab";
import ContentTab from "./tabs/ContentTab";
import WorkflowsTab from "./tabs/WorkflowsTab";
import ActionLogSlot from "./tabs/ActionLogSlot";

// Client-side component for rendering tasks (used for Client role)
import { TaskItem } from "@/components/projects/TaskItem";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

function ProjectDetailsSkeleton() {
    return (
        <div className="flex h-[calc(100vh-8rem)] w-full gap-6 animate-pulse">
            <div className="flex-1 p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="flex gap-2 mb-6">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
            </div>
            <div className="w-[350px] shrink-0 border-l border-border h-full hidden xl:block p-4 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
}

function TabSkeleton() {
    return (
        <div className="space-y-4 pt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
}

// Helper to wrap tasks for Client view
function ClientTasksWrapper({ tasks }: { tasks: any[] }) {
    const priorityMap: Record<string, { label: string; color: string }> = {
        LOW: { label: "Baja", color: "text-slate-500 bg-slate-500/10" },
        MEDIUM: { label: "Media", color: "text-amber-500 bg-amber-500/10" },
        HIGH: { label: "Alta", color: "text-red-500 bg-red-500/10" },
    };

    if (!tasks || tasks.length === 0) return <div className="p-8 text-center text-muted-foreground">No hay tareas visibles.</div>;

    return (
        <div className="grid gap-2">
            {tasks.map((task: any) => (
                <TaskItem key={task.id} task={task} priorityMap={priorityMap} />
            ))}
        </div>
    );
}


async function ProjectDetailsContent({ id }: { id: string }) {
    // Fetch user session and project core in parallel (both are cached)
    const [currentUser, project] = await Promise.all([
        getUserSession(),
        getProjectCore(id)
    ]);

    try {
        // Client-specific flow: re-fetch from client-scoped action
        if (currentUser?.role === 'CLIENTE') {
            const { getClientProjectDetails } = await import('@/app/actions/client-actions');
            const clientProject = await getClientProjectDetails(id);

            if (clientProject) {
                return (
                    <ProjectDetailsView
                        project={clientProject}
                        currentUser={currentUser}
                        tasksSlot={<ClientTasksWrapper tasks={clientProject.tasks} />}
                    />
                );
            }
        }

        // ADMIN / REGULAR USER FLOW
        if (!project) notFound();

        return (
            <ProjectDetailsView
                project={project}
                currentUser={currentUser}
                tasksSlot={
                    <Suspense fallback={<TabSkeleton />}>
                        <TasksTab projectId={id} isClient={false} />
                    </Suspense>
                }
                planningSlot={
                    <Suspense fallback={<TabSkeleton />}>
                        <PlanningTab projectId={id} isClient={false} />
                    </Suspense>
                }
                resourcesSlot={
                    <Suspense fallback={<TabSkeleton />}>
                        <ResourcesTab projectId={id} />
                    </Suspense>
                }
                creativitySlot={
                    <Suspense fallback={<TabSkeleton />}>
                        <CreativityTab projectId={id} currentUser={currentUser} />
                    </Suspense>
                }
                competitorsSlot={
                    <Suspense fallback={<TabSkeleton />}>
                        <CompetitorsTab projectId={id} />
                    </Suspense>
                }
                adsSlot={
                    <Suspense fallback={<TabSkeleton />}>
                        <AdsTab projectId={id} currentUser={currentUser} />
                    </Suspense>
                }
                contentSlot={
                    <Suspense fallback={<TabSkeleton />}>
                        <ContentTab projectId={id} isClient={false} />
                    </Suspense>
                }
                workflowsSlot={
                    <Suspense fallback={<TabSkeleton />}>
                        <WorkflowsTab projectId={id} isClient={false} />
                    </Suspense>
                }
                actionLogSlot={
                    <Suspense fallback={<div className="p-4 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-20 w-full" /></div>}>
                        <ActionLogSlot projectId={id} currentUser={currentUser} />
                    </Suspense>
                }
            />
        );

    } catch (e: any) {
        console.error("Error fetching project details:", e);
        return (
            <div className="p-8">
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-2">Error de Conexión</h3>
                    <p>No se pudo cargar el proyecto.</p>
                </div>
            </div>
        );
    }
}


export default async function ProjectDetailsPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={<ProjectDetailsSkeleton />}>
            <ProjectDetailsContent id={id} />
        </Suspense>
    );
}


