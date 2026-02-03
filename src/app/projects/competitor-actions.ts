"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCompetitor(prevState: any, formData: FormData) {
    const projectId = formData.get("projectId") as string;
    const name = formData.get("name") as string;
    const website = formData.get("website") as string;
    const description = formData.get("description") as string;
    const competitiveAdvantages = formData.get("competitiveAdvantages") as string;
    const metaAdsUrl = formData.get("metaAdsUrl") as string;
    const googleAdsUrl = formData.get("googleAdsUrl") as string;
    const products = formData.get("products") as string; // JSON string
    const services = formData.get("services") as string; // JSON string
    const pricing = formData.get("pricing") as string;
    const offers = formData.get("offers") as string;

    if (!projectId || !name) {
        return {
            message: "Proyecto y nombre son requeridos",
            success: false,
        };
    }

    try {
        await db.competitor.create({
            data: {
                projectId,
                name,
                website: website || null,
                description: description || null,
                competitiveAdvantages: competitiveAdvantages || null,
                metaAdsUrl: metaAdsUrl || null,
                googleAdsUrl: googleAdsUrl || null,
                products: products || null,
                services: services || null,
                pricing: pricing || null,
                offers: offers || null,
            },
        });

        revalidatePath(`/projects/${projectId}`);
        return { message: "Competidor agregado", success: true };
    } catch (error) {
        console.error("Error creating competitor:", error);
        return { message: "Error al crear competidor", success: false };
    }
}

export async function updateCompetitor(id: string, prevState: any, formData: FormData) {
    const projectId = formData.get("projectId") as string;
    const name = formData.get("name") as string;
    const website = formData.get("website") as string;
    const description = formData.get("description") as string;
    const competitiveAdvantages = formData.get("competitiveAdvantages") as string;
    const metaAdsUrl = formData.get("metaAdsUrl") as string;
    const googleAdsUrl = formData.get("googleAdsUrl") as string;
    const products = formData.get("products") as string;
    const services = formData.get("services") as string;
    const pricing = formData.get("pricing") as string;
    const offers = formData.get("offers") as string;

    if (!name) {
        return {
            message: "Nombre es requerido",
            success: false,
        };
    }

    try {
        await db.competitor.update({
            where: { id },
            data: {
                name,
                website: website || null,
                description: description || null,
                competitiveAdvantages: competitiveAdvantages || null,
                metaAdsUrl: metaAdsUrl || null,
                googleAdsUrl: googleAdsUrl || null,
                products: products || null,
                services: services || null,
                pricing: pricing || null,
                offers: offers || null,
            },
        });

        revalidatePath(`/projects/${projectId}`);
        return { message: "Competidor actualizado", success: true };
    } catch (error) {
        console.error("Error updating competitor:", error);
        return { message: "Error al actualizar competidor", success: false };
    }
}

export async function deleteCompetitor(id: string, projectId: string) {
    try {
        await db.competitor.delete({
            where: { id },
        });

        revalidatePath(`/projects/${projectId}`);
        return { message: "Competidor eliminado", success: true };
    } catch (error) {
        console.error("Error deleting competitor:", error);
        return { message: "Error al eliminar competidor", success: false };
    }
}
