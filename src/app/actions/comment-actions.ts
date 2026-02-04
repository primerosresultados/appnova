"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createComment(reportId: string, content: string, userId: string) {
    try {
        const comment = await db.adReportComment.create({
            data: {
                reportId,
                content,
                userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        revalidatePath(`/projects`);
        return { success: true, data: comment };
    } catch (error) {
        console.error("Error creating comment:", error);
        return { success: false, error: "Error al crear comentario" };
    }
}

export async function getReportComments(reportId: string) {
    try {
        const comments = await db.adReportComment.findMany({
            where: { reportId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        return { success: true, data: comments };
    } catch (error) {
        console.error("Error fetching comments:", error);
        return { success: false, error: "Error al obtener comentarios" };
    }
}

export async function deleteComment(commentId: string, userId: string) {
    try {
        // Verify ownership
        const comment = await db.adReportComment.findUnique({
            where: { id: commentId },
        });

        if (!comment || comment.userId !== userId) {
            return { success: false, error: "No tienes permiso para eliminar este comentario" };
        }

        await db.adReportComment.delete({
            where: { id: commentId },
        });

        revalidatePath(`/projects`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting comment:", error);
        return { success: false, error: "Error al eliminar comentario" };
    }
}
