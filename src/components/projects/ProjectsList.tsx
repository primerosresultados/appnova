import { db } from "@/lib/db";
import { ProjectsListClient } from "@/components/projects/ProjectsListClient";

async function getProjects() {
    try {
        const projects = await db.project.findMany({
            orderBy: { updatedAt: "desc" },
            include: {
                client: true,
                _count: {
                    select: { tasks: true }
                }
            }
        });
        return projects;
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

export async function ProjectsList() {
    const projects = await getProjects();

    return <ProjectsListClient projects={projects} />;
}
