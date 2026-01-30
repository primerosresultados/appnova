"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function applyWorkflow(projectId: string, workflowId: string) {
    try {
        const existing = await db.projectWorkflow.findFirst({
            where: {
                projectId,
                workflowId
            }
        });

        if (existing) {
            return { success: false, error: "Este flujo de trabajo ya está aplicado al proyecto." };
        }

        await db.projectWorkflow.create({
            data: {
                projectId,
                workflowId
            }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to apply workflow:", error);
        return { success: false, error: "Error al aplicar el flujo de trabajo." };
    }
}

export async function removeWorkflowFromProject(projectId: string, projectWorkflowId: string) {
    try {
        await db.projectWorkflow.delete({
            where: {
                id: projectWorkflowId
            }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to remove workflow:", error);
        return { success: false, error: "Error al eliminar el flujo de trabajo." };
    }
}
