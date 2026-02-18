"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getProspects(status?: string) {
    const where = status && status !== "all" ? { status } : {};
    return db.prospect.findMany({
        where,
        include: {
            quoteItems: true,
            client: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createProspect(prevState: any, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        if (!name?.trim()) return { message: "El nombre es requerido", success: false };

        await db.prospect.create({
            data: {
                name: name.trim(),
                email: (formData.get("email") as string) || null,
                phone: (formData.get("phone") as string) || null,
                company: (formData.get("company") as string) || null,
                source: (formData.get("source") as string) || null,
                notes: (formData.get("notes") as string) || null,
                status: "NUEVO",
            },
        });

        revalidatePath("/prospectos");
        return { message: "Prospecto creado exitosamente", success: true };
    } catch (error: any) {
        console.error("[createProspect] Error:", error?.message);
        return { message: "Error al crear prospecto", success: false };
    }
}

export async function updateProspectStatus(id: string, status: string) {
    try {
        await db.prospect.update({
            where: { id },
            data: { status },
        });
        revalidatePath("/prospectos");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function updateProspect(id: string, data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    source?: string | null;
    notes?: string | null;
}) {
    try {
        await db.prospect.update({
            where: { id },
            data,
        });
        revalidatePath("/prospectos");
        return { success: true, message: "Prospecto actualizado" };
    } catch (error: any) {
        console.error("[updateProspect] Error:", error?.message);
        return { success: false, message: "Error al actualizar prospecto" };
    }
}

export async function deleteProspect(id: string) {
    try {
        await db.prospect.delete({ where: { id } });
        revalidatePath("/prospectos");
        return { message: "Prospecto eliminado", success: true };
    } catch (error) {
        return { message: "Error al eliminar", success: false };
    }
}

export async function addQuoteItem(prevState: any, formData: FormData) {
    try {
        const prospectId = formData.get("prospectId") as string;
        const service = formData.get("service") as string;
        const unitPrice = parseFloat(formData.get("unitPrice") as string);
        const quantity = parseInt(formData.get("quantity") as string) || 1;

        if (!service?.trim()) return { message: "El servicio es requerido", success: false };
        if (isNaN(unitPrice) || unitPrice <= 0) return { message: "Precio inválido", success: false };

        await db.quoteItem.create({
            data: {
                service: service.trim(),
                description: (formData.get("description") as string) || null,
                quantity,
                unitPrice,
                prospectId,
            },
        });

        // Auto-update prospect status to COTIZADO if still NUEVO or CONTACTADO
        const prospect = await db.prospect.findUnique({ where: { id: prospectId } });
        if (prospect && (prospect.status === "NUEVO" || prospect.status === "CONTACTADO")) {
            await db.prospect.update({
                where: { id: prospectId },
                data: { status: "COTIZADO" },
            });
        }

        revalidatePath("/prospectos");
        return { message: "Item agregado", success: true };
    } catch (error: any) {
        console.error("[addQuoteItem] Error:", error?.message);
        return { message: "Error al agregar item", success: false };
    }
}

export async function updateQuoteSettings(prospectId: string, data: {
    quoteNotes?: string | null;
    quoteValidDays?: number | null;
    quoteDiscount?: number | null;
    quoteTaxRate?: number | null;
}) {
    try {
        await db.prospect.update({
            where: { id: prospectId },
            data,
        });
        revalidatePath("/prospectos");
        return { success: true };
    } catch (error: any) {
        console.error("[updateQuoteSettings] Error:", error?.message);
        return { success: false, message: "Error al actualizar configuración de cotización" };
    }
}

export async function deleteQuoteItem(id: string) {
    try {
        await db.quoteItem.delete({ where: { id } });
        revalidatePath("/prospectos");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function convertToClient(prospectId: string) {
    try {
        const prospect = await db.prospect.findUnique({
            where: { id: prospectId },
            include: { quoteItems: true },
        });
        if (!prospect) return { message: "Prospecto no encontrado", success: false };

        // Create client from prospect data
        const client = await db.client.create({
            data: {
                name: prospect.company || prospect.name,
                email: prospect.email,
                phone: prospect.phone,
                status: "ACTIVE",
            },
        });

        // Link prospect to client and mark as won
        await db.prospect.update({
            where: { id: prospectId },
            data: { status: "GANADO", clientId: client.id },
        });

        revalidatePath("/prospectos");
        revalidatePath("/clients");
        return { message: "Cliente creado exitosamente", success: true, clientId: client.id };
    } catch (error: any) {
        console.error("[convertToClient] Error:", error?.message);
        return { message: "Error al convertir", success: false };
    }
}
