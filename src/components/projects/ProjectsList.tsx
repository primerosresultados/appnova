import { db } from "@/lib/db";
import { ProjectsListClient } from "@/components/projects/ProjectsListClient";
import { unstable_cache } from "next/cache";

// Cache projects list for 30 seconds
const getCachedProjects = unstable_cache(
    async () => {
        const projects = await db.project.findMany({
            take: 50,
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                dueDate: true,
                updatedAt: true,
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
                    orderBy: { createdAt: 'desc' },
                    select: {
                        content: true,
                        createdAt: true,
                        user: {
                            select: { name: true }
                        }
                    }
                }
            }
        });
        return projects;
    },
    ['projects-list'],
    { revalidate: 30 }
);

async function getProjects() {
    try {
        return await getCachedProjects();
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

export async function ProjectsList() {
    const projects = await getProjects();

    return <ProjectsListClient projects={projects} />;
}
