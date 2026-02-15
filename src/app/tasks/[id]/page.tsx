
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TaskDetailView } from "@/components/tasks/TaskDetailView";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

async function getTask(id: string) {
    return db.task.findUnique({
        where: { id },
        include: {
            project: {
                select: { id: true, name: true, client: { select: { id: true, name: true } } }
            },
            assignee: { select: { id: true, name: true, avatar: true } },
            actionLogs: {
                take: 20,
                include: { user: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: 'desc' as const }
            }
        }
    });
}

export default async function TaskDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const task = await getTask(id);

    if (!task) {
        notFound();
    }

    return <TaskDetailView task={task} />;
}
