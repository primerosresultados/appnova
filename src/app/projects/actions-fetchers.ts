
import { db } from "@/lib/db";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Fetchers for independent sections
export async function getProjectCore(id: string) {
    console.time(`getProjectCore-${id}`);
    const project = await db.project.findUnique({
        where: { id },
        include: {
            client: { select: { id: true, name: true } }
        }
    });
    console.timeEnd(`getProjectCore-${id}`);
    return project;
}

export async function getProjectTasks(id: string) {
    return db.task.findMany({
        where: { projectId: id },
        orderBy: { createdAt: 'desc' },
        include: {
            assignee: { select: { id: true, name: true, avatar: true } }
        }
    });
}

export async function getProjectMilestones(id: string) {
    return db.milestone.findMany({
        where: { projectId: id },
        orderBy: { date: 'asc' }
    });
}

export async function getProjectResources(id: string) {
    return db.resource.findMany({
        where: { projectId: id },
        orderBy: { createdAt: 'desc' },
        include: { votes: true }
    });
}

export async function getProjectLogs(id: string) {
    return db.actionLog.findMany({
        where: { projectId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            user: { select: { id: true, name: true, avatar: true } }
        }
    });
}

export async function getProjectContents(id: string) {
    return db.content.findMany({
        where: { projectId: id },
        orderBy: { publishDate: 'asc' }
    });
}

export async function getProjectCompetitors(id: string) {
    return db.competitor.findMany({
        where: { projectId: id },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getProjectWorkflows(id: string) {
    return db.projectWorkflow.findMany({
        where: { projectId: id },
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
    });
}

export async function getProjectAdReports(id: string) {
    return db.adReport.findMany({
        where: { projectId: id },
        orderBy: { startDate: 'desc' },
        include: {
            createdBy: { select: { id: true, name: true, avatar: true } },
            blocks: { orderBy: { order: 'asc' } },
            comments: {
                include: { user: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: 'asc' }
            }
        }
    });
}
