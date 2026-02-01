"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadFile } from "@/lib/upload";

const resourceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["DRIVE", "LINK", "FILE", "CREDENTIAL"]),
    url: z.string().optional(),
    content: z.string().optional(),
    projectId: z.string().min(1, "Project ID is required"),
});

export async function createResource(prevState: any, formData: FormData) {
    // Handle file upload if type is FILE
    const type = formData.get("type") as string;
    let url = formData.get("url") as string | null;

    if (type === "FILE") {
        const file = formData.get("file") as File | null;
        if (file && file.size > 0) {
            const filePath = await uploadFile(file);
            if (filePath) {
                url = filePath;
            }
        }
    }

    const validatedFields = resourceSchema.safeParse({
        name: formData.get("name"),
        type: formData.get("type"),
        url: url || undefined,
        content: formData.get("content") || undefined, // Fix: Convert null to undefined
        projectId: formData.get("projectId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Resource.",
            success: false,
        };
    }

    const { name, type: validType, url: validUrl, content, projectId } = validatedFields.data;

    try {
        await db.resource.create({
            data: {
                name,
                type: validType,
                url: validUrl || null,
                content: content || null,
                projectId,
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Database Error: Failed to Create Resource.",
            success: false,
        };
    }

    revalidatePath(`/projects/${projectId}`);
    return { message: "Resource created successfully", success: true };
}

export async function deleteResource(id: string, projectId: string) {
    try {
        await db.resource.delete({
            where: { id },
        });
        revalidatePath(`/projects/${projectId}`);
        return { message: "Resource deleted successfully", success: true };
    } catch (error) {
        return { message: "Failed to delete resource", success: false };
    }
}
