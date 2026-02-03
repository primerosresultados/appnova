"use server";

import { db } from "@/lib/db";
import { getUserSession } from "./auth-actions";

export async function getClientProjects() {
    const user = await getUserSession();

    if (!user || user.role !== 'CLIENTE' || !user.clientId) {
        return { success: false, error: "Unauthorized or no client assigned" };
    }

    try {
        const projects = await db.project.findMany({
            where: {
                clientId: user.clientId
            },
            select: {
                id: true,
                name: true,
                status: true,
                client: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return { success: true, data: projects };
    } catch (error) {
        console.error("Error fetching client projects:", error);
        return { success: false, error: "Failed to fetch projects" };
    }
}

export async function getClientProjectDetails(id: string) {
    const user = await getUserSession();

    // Ensure the project belongs to the client (if user is client)
    const where: any = { id };
    if (user?.role === 'CLIENTE' && user.clientId) {
        where.clientId = user.clientId;
    }

    try {
        const project = await db.project.findUnique({
            where,
            include: {
                client: true,
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
                            { userId: user?.id }
                        ]
                    },
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: { select: { id: true, name: true, avatar: true } }
                    }
                },
                contents: {
                    orderBy: { publishDate: 'asc' },
                    include: {
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
                }
            }
        });

        return project;
    } catch (error) {
        console.error("Error fetching client project details:", error);
        return null;
    }
}
