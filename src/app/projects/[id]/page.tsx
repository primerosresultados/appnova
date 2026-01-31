
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getWorkflows } from "@/app/workflows/actions";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

// Separate data fetching for better granularity if needed later
// For now, we still fetch the big object but we can parallelize with workflows
async function getProject(id: string) {
    const project = await db.project.findUnique({
        where: { id },
        include: {
            client: true,
            tasks: {
                orderBy: { createdAt: 'desc' },
                include: {
                    assignee: true,
                    actionLogs: {
                        include: { user: true },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            },
            milestones: {
                orderBy: { date: 'asc' }
            },
            resources: {
                orderBy: { createdAt: 'desc' }
            },
            actionLogs: {
                orderBy: { createdAt: 'asc' },
                include: {
                    user: true
                }
            },
            contents: {
                orderBy: { publishDate: 'asc' }
            },
            workflows: {
                include: {
                    workflow: {
                        include: {
                            stages: {
                                include: { tasks: true },
                                orderBy: { order: 'asc' }
                            }
                        }
                    }
                }
            }
        }
    });
    return project;
}

function ProjectDetailsSkeleton() {
    return (
        <div className="flex h-[calc(100vh-4rem)] -m-6 md:-m-8 animate-pulse">
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

async function ProjectDetailsContent({ id }: { id: string }) {
    let project = null;
    let allWorkflows: any[] = [];
    let error = null;

    try {
        // Parallelize the heavy lifting
        [project, allWorkflows] = await Promise.all([
            getProject(id),
            getWorkflows()
        ]);
    } catch (e: any) {
        console.error("Error fetching project details:", e);
        error = e.message;
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-2">Error de Conexión</h3>
                    <p>No se pudo cargar el proyecto. Verifica la conexión a la base de datos.</p>
                    <code className="block mt-4 text-xs bg-black/20 p-2 rounded">{error}</code>
                </div>
            </div>
        );
    }

    if (!project) {
        notFound();
    }

    return <ProjectDetailsView project={project} allWorkflows={allWorkflows} />;
}

export default async function ProjectDetailsPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={<ProjectDetailsSkeleton />}>
            <ProjectDetailsContent id={id} />
        </Suspense>
    );
}

// Force dynamic to ensure fresh data
export const dynamic = 'force-dynamic';
