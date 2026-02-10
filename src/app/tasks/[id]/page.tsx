
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TaskDetailView } from "@/components/tasks/TaskDetailView";
import { unstable_cache } from "next/cache";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

// Cache task detail for 30 seconds — this is a deep join that was hitting DB every render
const getCachedTask = unstable_cache(
    async (id: string) => {
        return db.task.findUnique({
            where: { id },
            include: {
                project: {
                    select: { id: true, name: true, client: { select: { id: true, name: true } } }
                },
                assignee: { select: { id: true, name: true, avatar: true } },
                actionLogs: {
                    take: 50,
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                    orderBy: { createdAt: 'desc' as const }
                }
            }
        });
    },
    ['task-detail'],
    { revalidate: 30 }
);

async function getTask(id: string) {
    return getCachedTask(id);
}

export default async function TaskDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const task = await getTask(id);

    if (!task) {
        notFound();
    }

    return <TaskDetailView task={task} />;
}
