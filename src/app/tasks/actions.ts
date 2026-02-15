"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getUserSession } from "@/app/actions/auth-actions";

export async function createTaskLog(taskId: string, content: string, type: string = "NOTE") {
    try {
        const user = await getUserSession();

        await db.actionLog.create({
            data: {
                content,
                type,
                taskId,
                projectId: (await db.task.findUniqueOrThrow({ where: { id: taskId } })).projectId,
                userId: user?.id,
            }
        });
        revalidatePath(`/projects`);
        return { success: true };
    } catch (error) {
        console.error("Failed to create task log", error);
        return { success: false, message: "Failed to create log" };
    }
}

export async function uploadTaskAttachment(taskId: string, attachmentData: string) {
    // In a real app, successful upload would happen client-side or via API route, 
    // and we just save the URL here.
    // Since `attachments` is a JSON string, we need to append.
    try {
        const task = await db.task.findUnique({ where: { id: taskId } });
        if (!task) return { success: false };

        let currentAttachments = [];
        try {
            currentAttachments = task.attachments ? JSON.parse(task.attachments) : [];
        } catch (e) {
            currentAttachments = [];
        }

        currentAttachments.push(JSON.parse(attachmentData));

        await db.task.update({
            where: { id: taskId },
            data: {
                attachments: JSON.stringify(currentAttachments)
            }
        });
        revalidatePath(`/projects`);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteTask(taskId: string) {
    try {
        const task = await db.task.findUnique({ where: { id: taskId } });
        if (!task) return { success: false, message: "Task not found" };

        const projectId = task.projectId;

        await db.task.delete({
            where: { id: taskId },
        });

        revalidatePath(`/projects/${projectId}`);
        revalidatePath(`/projects`);
        revalidatePath(`/tasks`);
        return { success: true, message: "Task deleted successfully" };
    } catch (error) {
        console.error("Failed to delete task", error);
        return { success: false, message: "Failed to delete task" };
    }
}

export async function archiveTask(taskId: string) {
    try {
        const task = await db.task.findUnique({ where: { id: taskId } });
        if (!task) return { success: false, message: "Task not found" };

        const projectId = task.projectId;

        await db.task.update({
            where: { id: taskId },
            data: { status: "DONE" },
        });

        revalidatePath(`/projects/${projectId}`);
        revalidatePath(`/projects`);
        revalidatePath(`/tasks`);
        return { success: true, message: "Task archived successfully" };
    } catch (error) {
        console.error("Failed to archive task", error);
    }
}

export async function updateTaskStatus(taskId: string, status: string, path?: string) {
    try {
        const task = await db.task.findUnique({ where: { id: taskId } });
        if (!task) return { success: false, message: "Task not found" };

        await db.task.update({
            where: { id: taskId },
            data: { status },
        });

        if (path) {
            revalidatePath(path);
        }
        revalidatePath(`/projects/${task.projectId}`);
        revalidatePath(`/tasks`);
        revalidatePath(`/dashboard`);

        return { success: true, message: "Status updated" };
    } catch (error) {
        console.error("Failed to update status", error);
        return { success: false, message: "Failed to update status" };
    }
}
