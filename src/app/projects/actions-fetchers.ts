
import { db } from "@/lib/db";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { unstable_cache } from "next/cache";

// Cache project core data for 60 seconds
const getCachedProjectCore = unstable_cache(
    async (id: string) => {
        return db.project.findUnique({
            where: { id },
            include: {
                client: { select: { id: true, name: true } }
            }
        });
    },
    ['project-core'],
    { revalidate: 60 }
);

// Fetchers for independent sections
export async function getProjectCore(id: string) {
    return getCachedProjectCore(id);
}

// Cache all tab fetchers for 30 seconds to avoid redundant DB hits on rapid navigation
const getCachedProjectTasks = unstable_cache(
    async (id: string) => {
        return db.task.findMany({
            where: { projectId: id },
            orderBy: { createdAt: 'desc' },
            include: {
                assignee: { select: { id: true, name: true, avatar: true } }
            }
        });
    },
    ['project-tasks'],
    { revalidate: 30 }
);

export async function getProjectTasks(id: string) {
    return getCachedProjectTasks(id);
}

const getCachedProjectMilestones = unstable_cache(
    async (id: string) => {
        return db.milestone.findMany({
            where: { projectId: id },
            orderBy: { date: 'asc' }
        });
    },
    ['project-milestones'],
    { revalidate: 30 }
);

export async function getProjectMilestones(id: string) {
    return getCachedProjectMilestones(id);
}

const getCachedProjectResources = unstable_cache(
    async (id: string) => {
        return db.resource.findMany({
            where: { projectId: id },
            orderBy: { createdAt: 'desc' },
            include: {
                votes: {
                    select: { id: true, userId: true }
                }
            }
        });
    },
    ['project-resources'],
    { revalidate: 30 }
);

export async function getProjectResources(id: string) {
    return getCachedProjectResources(id);
}

const getCachedProjectLogs = unstable_cache(
    async (id: string) => {
        return db.actionLog.findMany({
            where: { projectId: id },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                user: { select: { id: true, name: true, avatar: true } }
            }
        });
    },
    ['project-logs'],
    { revalidate: 30 }
);

export async function getProjectLogs(id: string) {
    return getCachedProjectLogs(id);
}

const getCachedProjectContents = unstable_cache(
    async (id: string) => {
        return db.content.findMany({
            where: { projectId: id },
            orderBy: { publishDate: 'asc' },
            include: {
                creator: { select: { id: true, name: true, avatar: true } }
            }
        });
    },
    ['project-contents'],
    { revalidate: 30 }
);

export async function getProjectContents(id: string) {
    return getCachedProjectContents(id);
}

const getCachedProjectCompetitors = unstable_cache(
    async (id: string) => {
        return db.competitor.findMany({
            where: { projectId: id },
            orderBy: { createdAt: 'desc' }
        });
    },
    ['project-competitors'],
    { revalidate: 30 }
);

export async function getProjectCompetitors(id: string) {
    return getCachedProjectCompetitors(id);
}

const getCachedProjectWorkflows = unstable_cache(
    async (id: string) => {
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
    },
    ['project-workflows'],
    { revalidate: 30 }
);

export async function getProjectWorkflows(id: string) {
    return getCachedProjectWorkflows(id);
}

const getCachedProjectAdReports = unstable_cache(
    async (id: string) => {
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
    },
    ['project-ad-reports'],
    { revalidate: 30 }
);

export async function getProjectAdReports(id: string) {
    return getCachedProjectAdReports(id);
}

// Lightweight query to get content type counts for display in project header
const getCachedProjectContentCounts = unstable_cache(
    async (id: string) => {
        const contents = await db.content.findMany({
            where: { projectId: id },
            select: { type: true }
        });
        const counts: Record<string, number> = {};
        for (const c of contents) {
            counts[c.type] = (counts[c.type] || 0) + 1;
        }
        return counts;
    },
    ['project-content-counts'],
    { revalidate: 30 }
);

export async function getProjectContentCounts(id: string) {
    return getCachedProjectContentCounts(id);
}

// Fetcher for project conversions
const getCachedProjectConversions = unstable_cache(
    async (id: string) => {
        return db.conversion.findMany({
            where: { projectId: id },
            orderBy: { date: 'desc' },
            include: {
                createdBy: { select: { id: true, name: true, avatar: true } }
            }
        });
    },
    ['project-conversions'],
    { revalidate: 30 }
);

export async function getProjectConversions(id: string) {
    return getCachedProjectConversions(id);
}
