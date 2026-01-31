"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTaskLog(taskId: string, content: string, type: string = "NOTE") {
    try {
        await db.actionLog.create({
            data: {
                content,
                type,
                taskId,
                // We need to link it to the project as well for global visibility? 
                // For now, let's fetch the task to get the projectId

                projectId: (await db.task.findUniqueOrThrow({ where: { id: taskId } })).projectId,
                // User ID should be handled via auth context, doing generic for now
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
        return { success: false, message: "Failed to archive task" };
    }
}
