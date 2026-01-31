"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const projectSchema = z.object({
    name: z.string().min(1, "Name is required"),
    clientId: z.string().min(1, "Client is required"),
    description: z.string().optional(),
    status: z.enum(["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ON_HOLD"]),
    dueDate: z.string().optional(),
    budget: z.coerce.number().optional(),
});

export async function createProject(prevState: any, formData: FormData) {
    const validatedFields = projectSchema.safeParse({
        name: formData.get("name"),
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

    const { name, clientId, description, status, dueDate, budget } = validatedFields.data;

    try {
        await db.project.create({
            data: {
                name,
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
