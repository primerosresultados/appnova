"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const projectSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().optional(), // Custom project code like MO239
    clientId: z.string().min(1, "Client is required"),
    description: z.string().optional(),
    status: z.enum(["ACTIVE", "ALERT", "CANCELLED"]),
    dueDate: z.string().optional(),
    budget: z.coerce.number().optional(),
});

export async function createProject(prevState: any, formData: FormData) {
    const validatedFields = projectSchema.safeParse({
        name: formData.get("name"),
        code: formData.get("code"),
        clientId: formData.get("clientId"),
        description: formData.get("description"),
        status: formData.get("status"),
        dueDate: formData.get("dueDate"),
        budget: formData.get("budget"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Project.",
            success: false,
        };
    }

    const { name, code, clientId, description, status, dueDate, budget } = validatedFields.data;

    try {
        await db.project.create({
            data: {
                name,
                code,
                clientId,
                description,
                status,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                budget,
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Database Error: Failed to Create Project.",
            success: false,
        };
    }

    revalidatePath("/projects");
    revalidatePath("/clients");
    return { message: "Project created successfully", success: true };
}

export async function deleteProject(id: string) {
    try {
        await db.project.delete({
            where: { id },
        });
        revalidatePath("/projects");
        revalidatePath("/clients");
        return { message: "Project deleted successfully", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Failed to delete project", success: false };
    }
}

export async function archiveProject(id: string) {
    try {
        await db.project.update({
            where: { id },
            data: { status: "ARCHIVED" },
        });
        revalidatePath("/projects");
        revalidatePath("/clients");
        return { message: "Project archived successfully", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Failed to archive project", success: false };
    }
}

export async function unarchiveProject(id: string) {
    try {
        await db.project.update({
            where: { id },
            data: { status: "ACTIVE" },
        });
        revalidatePath("/projects");
        revalidatePath("/clients");
        return { message: "Project unarchived successfully", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Failed to unarchive project", success: false };
    }
}

export async function updateProject(id: string, formData: FormData) {
    try {
        const data: Record<string, any> = {};

        // Basic fields – only include if present in form
        const name = formData.get("name") as string | null;
        if (name) data.name = name;

        const description = formData.get("description") as string | null;
        if (description !== null) data.description = description || "";

        const status = formData.get("status") as string | null;
        if (status) data.status = status;

        const priority = formData.get("priority") as string | null;
        if (priority) data.priority = priority;

        const dueDate = formData.get("dueDate") as string | null;
        if (dueDate) data.dueDate = new Date(dueDate);

        const budget = formData.get("budget") as string | null;
        if (budget && budget !== "") data.budget = parseFloat(budget);

        // Content count fields – always include as integers
        const contentFields = ["graficas", "reels", "historias", "carruseles", "lives", "mailings", "postSeos"] as const;
        for (const field of contentFields) {
            const raw = formData.get(field) as string | null;
            if (raw !== null) {
                const parsed = parseInt(raw, 10);
                data[field] = isNaN(parsed) ? 0 : parsed;
            }
        }

        // Text fields for project brief / dashboard
        const textFields = ["objectives", "communicationTone", "brandManual", "buyerPersona", "oferta"] as const;
        for (const field of textFields) {
            const val = formData.get(field) as string | null;
            if (val !== null) data[field] = val || null;
        }

        console.log("[updateProject] Updating project", id, "with data:", JSON.stringify(data));

        await db.project.update({
            where: { id },
            data,
        });

        revalidatePath("/projects");
        revalidatePath(`/projects/${id}`);
        revalidatePath("/clients");
        return { message: "Project updated successfully", success: true };
    } catch (error: any) {
        console.error("[updateProject] Error:", error?.message || error);
        return { message: error?.message || "Failed to update project", success: false };
    }
}
