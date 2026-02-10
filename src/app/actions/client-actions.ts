"use server";

import { db } from "@/lib/db";
import { getUserSession } from "./auth-actions";
import { unstable_cache } from "next/cache";

// Cached fetcher for client projects list (keyed by clientId)
const getCachedClientProjects = unstable_cache(
    async (clientId: string) => {
        return db.project.findMany({
            where: { clientId },
            select: {
                id: true,
                name: true,
                status: true,
                client: { select: { name: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });
    },
    ['client-projects'],
    { revalidate: 30 }
);

export async function getClientProjects() {
    const user = await getUserSession();

    if (!user || user.role !== 'CLIENTE' || !user.clientId) {
        return { success: false, error: "Unauthorized or no client assigned" };
    }

    try {
        const projects = await getCachedClientProjects(user.clientId);
        return { success: true, data: projects };
    } catch (error) {
        console.error("Error fetching client projects:", error);
        return { success: false, error: "Failed to fetch projects" };
    }
}

// Cached fetcher for client project details (keyed by projectId + clientId + userId)
const getCachedClientProjectDetails = unstable_cache(
    async (projectId: string, clientId: string | null, userId: string | null) => {
        const where: any = { id: projectId };
        if (clientId) {
            where.clientId = clientId;
        }

        return db.project.findUnique({
            where,
            include: {
                client: { select: { id: true, name: true, email: true, phone: true } },
                tasks: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        assignee: { select: { id: true, name: true, avatar: true } },
                    }
                },
                milestones: {
                    orderBy: { date: 'asc' }
                },
                actionLogs: {
                    where: {
                        OR: [
                            { isPublic: true },
                            ...(userId ? [{ userId }] : [])
                        ]
                    },
                    orderBy: { createdAt: 'asc' },
                    take: 100,
                    include: {
                        user: { select: { id: true, name: true, avatar: true } }
                    }
                },
                contents: {
                    orderBy: { publishDate: 'asc' },
                    take: 50,
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true,
                        description: true,
                        mediaUrl: true,
                        fileUrl: true,
                        links: true,
                        publishDate: true,
                        projectId: true,
                        creatorId: true,
                        createdAt: true,
                        updatedAt: true,
                        project: { select: { name: true } }
                    }
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
                },
                adReports: {
                    orderBy: { startDate: 'desc' },
                    take: 20,
                    include: {
                        createdBy: { select: { id: true, name: true, avatar: true } },
                        blocks: { orderBy: { order: 'asc' } },
                        comments: {
                            include: { user: { select: { id: true, name: true, avatar: true } } },
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                }
            }
        });
    },
    ['client-project-details'],
    { revalidate: 30 }
);

export async function getClientProjectDetails(id: string) {
    const user = await getUserSession();

    try {
        const clientId = (user?.role === 'CLIENTE' && user.clientId) ? user.clientId : null;
        const project = await getCachedClientProjectDetails(id, clientId, user?.id || null);
        return project;
    } catch (error) {
        console.error("Error fetching client project details:", error);
        return null;
    }
}
