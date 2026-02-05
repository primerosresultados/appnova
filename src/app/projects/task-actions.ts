"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    projectId: z.string().min(1, "Project ID is required"),
    status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional(),
    links: z.string().optional(), // Accepting comma-separated string for simplicity
});

import { getUserSession } from "@/app/actions/auth-actions";

export async function createTask(prevState: any, formData: FormData) {
    const validatedFields = taskSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        projectId: formData.get("projectId"),
        status: formData.get("status"),
        priority: formData.get("priority"),
        dueDate: formData.get("dueDate"),
        assigneeId: formData.get("assigneeId") === "unassigned" ? undefined : formData.get("assigneeId"),
        links: formData.get("links"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Task.",
            success: false,
        };
    }

    const { title, description, projectId, status, priority, dueDate, assigneeId, links } = validatedFields.data;

    try {
        const user = await getUserSession();

        const newTask = await db.task.create({
            data: {
                title,
                description,
                projectId,
                status,
                priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                assigneeId: assigneeId || null,
                links: links || null,
            },
        });

        // Create Action Log
        await db.actionLog.create({
            data: {
                projectId,
                content: `Nueva tarea creada: ${title}`,
                type: "TASK",
                userId: user?.id,
                taskId: newTask.id,
            }
        });

    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Database Error: Failed to Create Task.",
            success: false,
        };
    }

    revalidatePath(`/projects/${projectId}`);
    return { message: "Task created successfully", success: true };
}

export async function updateTask(taskId: string, prevState: any, formData: FormData) {
    const validatedFields = taskSchema.partial().safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        status: formData.get("status"),
        priority: formData.get("priority"),
        dueDate: formData.get("dueDate"),
        assigneeId: formData.get("assigneeId") === "unassigned" ? undefined : formData.get("assigneeId"),
        links: formData.get("links"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid Fields. Failed to Update Task.",
            success: false,
        };
    }

    try {
        const user = await getUserSession();
        const data: any = { ...validatedFields.data };
        if (data.dueDate) data.dueDate = new Date(data.dueDate);
        if (data.assigneeId === undefined) data.assigneeId = null;

        const updatedTask = await db.task.update({
            where: { id: taskId },
            data,
        });

        // Create Action Log for significant changes
        let logContent = `Tarea actualizada: ${updatedTask.title}`;
        if (data.status) logContent = `Estado de tarea "${updatedTask.title}" cambiado a ${data.status}`;

        await db.actionLog.create({
            data: {
                projectId: updatedTask.projectId,
                content: logContent,
                type: "TASK",
                userId: user?.id,
                taskId: updatedTask.id,
            }
        });

        revalidatePath(`/tasks/${taskId}`);
        revalidatePath(`/projects/${updatedTask.projectId}`);
        revalidatePath(`/tasks`);
        return { message: "Task updated successfully", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Database Error: Failed to Update Task.",
            success: false,
        };
    }
}
