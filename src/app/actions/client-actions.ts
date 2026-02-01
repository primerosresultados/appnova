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
