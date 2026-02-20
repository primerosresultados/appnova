
import { db } from "@/lib/db";
import { getProjectTasks } from "@/app/projects/actions-fetchers";
import ClientTasksTab from "@/components/projects/ClientTasksTab";

export default async function TasksTab({ projectId, isClient }: { projectId: string, isClient: boolean }) {
    // Fetch tasks and users in parallel on the server
    const [tasks, users] = await Promise.all([
        getProjectTasks(projectId),
        db.user.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })
    ]);

    return (
        <ClientTasksTab
            initialTasks={tasks}
            projectId={projectId}
            users={users}
            isClient={isClient}
        />
    );
}
