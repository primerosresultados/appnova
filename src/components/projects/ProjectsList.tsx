import { db } from "@/lib/db";
import { ProjectsListClient } from "@/components/projects/ProjectsListClient";

const projectSelect = {
    id: true,
    name: true,
    description: true,
    status: true,
    dueDate: true,
    updatedAt: true,
    graficas: true,
    reels: true,
    historias: true,
    carruseles: true,
    lives: true,
    mailings: true,
    postSeos: true,
    client: {
        select: {
            id: true,
            name: true
        }
    },
    _count: {
        select: { tasks: true }
    },
    actionLogs: {
        take: 1,
        orderBy: { createdAt: 'desc' as const },
        select: {
            content: true,
            createdAt: true,
            user: {
                select: { name: true }
            }
        }
    }
};

/**
 * Auto-sync project statuses based on task deadlines:
 * - If ANY task is overdue (dueDate < now && status != DONE) → project = ALERT
 * - If ALL tasks are DONE (and project was ALERT) → project = ACTIVE
 */
async function syncProjectStatuses() {
    try {
        const now = new Date();
        // Get all non-archived, non-cancelled projects that have tasks
        const projects = await db.project.findMany({
            where: { status: { notIn: ["ARCHIVED", "CANCELLED"] } },
            select: {
                id: true,
                status: true,
                tasks: {
                    select: {
                        id: true,
                        status: true,
                        dueDate: true,
                    },
                },
            },
        });

        const updates: Promise<any>[] = [];

        for (const project of projects) {
            if (project.tasks.length === 0) continue;

            const hasOverdue = project.tasks.some(
                (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE"
            );
            const allDone = project.tasks.every((t) => t.status === "DONE");

            if (hasOverdue && project.status !== "ALERT") {
                updates.push(
                    db.project.update({
                        where: { id: project.id },
                        data: { status: "ALERT" },
                    })
                );
            } else if (allDone && project.status === "ALERT") {
                updates.push(
                    db.project.update({
                        where: { id: project.id },
                        data: { status: "ACTIVE" },
                    })
                );
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
        }
    } catch (error) {
        console.error("[syncProjectStatuses] Error:", error);
    }
}

async function getProjects() {
    try {
        // Auto-sync statuses before fetching
        await syncProjectStatuses();

        const [active, archived] = await Promise.all([
            db.project.findMany({
                where: { status: { not: "ARCHIVED" } },
                take: 50,
                orderBy: { updatedAt: "desc" },
                select: projectSelect,
            }),
            db.project.findMany({
                where: { status: "ARCHIVED" },
                take: 50,
                orderBy: { updatedAt: "desc" },
                select: projectSelect,
            }),
        ]);
        return { active, archived };
    } catch (error) {
        console.error("Error fetching projects:", error);
        return { active: [], archived: [] };
    }
}

export async function ProjectsList() {
    const { active, archived } = await getProjects();

    return <ProjectsListClient projects={active} archivedProjects={archived} />;
}

