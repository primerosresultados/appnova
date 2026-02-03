"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserSession } from "@/app/actions/auth-actions";

const logSchema = z.object({
    projectId: z.string(),
    content: z.string().min(1, "Message is required"),
    type: z.string().default("NOTE"),
    isPublic: z.string().transform((val) => val === "true").optional(),
});

export async function addActionLog(prevState: any, formData: FormData) {
    const validatedFields = logSchema.safeParse({
        projectId: formData.get("projectId"),
        content: formData.get("content"),
        type: formData.get("type"),
        isPublic: formData.get("isPublic"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Failed to add log.",
            success: false,
        };
    }

    const { projectId, content, type, isPublic } = validatedFields.data;

    try {
        const user = await getUserSession();

        await db.actionLog.create({
            data: {
                projectId,
                content,
                type,
                userId: user?.id,
                isPublic: isPublic || false,
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Database Error: Failed to add log.",
            success: false,
        };
    }

    revalidatePath(`/projects/${projectId}`);
    return { message: "Log added", success: true };
}

export async function deleteActionLog(logId: string, projectId: string) {
    if (!logId || !projectId) {
        return { success: false, message: "Missing required fields" };
    }

    try {
        const user = await getUserSession();
        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // Ideally check ownership: user.id === log.userId OR user.role === ADMIN
        // For now, assuming anyone with access can delete for simplicity, or check basic ownership
        const log = await db.actionLog.findUnique({ where: { id: logId } });

        if (!log) {
            return { success: false, message: "Log not found" };
        }

        // Check permission (Admin or Owner)
        const isAdmin = user.role === 'SUPERADMIN' || user.role === 'PROJECT_MANAGER';
        const isOwner = log.userId === user.id;

        if (!isAdmin && !isOwner) {
            return { success: false, message: "No tienes permiso para eliminar este registro" };
        }

        await db.actionLog.delete({
            where: { id: logId }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true, message: "Registro eliminado" };
    } catch (error) {
        console.error("Delete Log Error:", error);
        return { success: false, message: "Error al eliminar registro" };
    }
}

export async function toggleLogVisibility(logId: string, projectId: string) {
    if (!logId || !projectId) {
        return { success: false, message: "Missing required fields" };
    }

    try {
        const user = await getUserSession();
        if (!user || user.role === 'CLIENTE') {
            return { success: false, message: "Unauthorized: Clientes no pueden cambiar visibilidad" };
        }

        const log = await db.actionLog.findUnique({ where: { id: logId } });
        if (!log) return { success: false, message: "Log not found" };

        const updatedLog = await db.actionLog.update({
            where: { id: logId },
            data: { isPublic: !log.isPublic }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true, message: updatedLog.isPublic ? "Visible para el cliente" : "Oculto para el cliente", isPublic: updatedLog.isPublic };
    } catch (error) {
        console.error("Toggle Log Visibility Error:", error);
        return { success: false, message: "Error al cambiar visibilidad" };
    }
}
