"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getUserSession } from "@/app/actions/auth-actions";

export async function createConversion(projectId: string, formData: FormData) {
    try {
        const user = await getUserSession();
        const quantity = parseInt(formData.get("quantity") as string) || 1;
        const amountRaw = formData.get("amount") as string;
        const amount = amountRaw ? parseFloat(amountRaw) : null;
        const description = (formData.get("description") as string) || null;
        const dateStr = formData.get("date") as string;
        const channel = (formData.get("channel") as string) || null;
        const tagsRaw = formData.get("tags") as string;
        const tags = tagsRaw ? tagsRaw : null;

        if (!dateStr || quantity < 1) {
            return { success: false, message: "Fecha y cantidad son obligatorios" };
        }

        await db.conversion.create({
            data: {
                quantity,
                amount: amount !== null && !isNaN(amount) ? amount : null,
                description,
                tags,
                channel,
                date: new Date(dateStr),
                projectId,
                createdById: user?.id || null,
            },
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true, message: "Conversión registrada" };
    } catch (error: any) {
        console.error("[createConversion] Error:", error?.message || error);
        return { success: false, message: "Error al registrar conversión" };
    }
}

export async function deleteConversion(id: string, projectId: string) {
    try {
        await db.conversion.delete({ where: { id } });
        revalidatePath(`/projects/${projectId}`);
        return { success: true, message: "Conversión eliminada" };
    } catch (error: any) {
        console.error("[deleteConversion] Error:", error?.message || error);
        return { success: false, message: "Error al eliminar conversión" };
    }
}
