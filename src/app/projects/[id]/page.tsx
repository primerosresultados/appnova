
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

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

import { getWorkflows } from "@/app/workflows/actions";

export default async function ProjectDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const project = await getProject(id);
    const allWorkflows = await getWorkflows();

    if (!project) {
        notFound();
    }

    return <ProjectDetailsView project={project} allWorkflows={allWorkflows} />;
}
