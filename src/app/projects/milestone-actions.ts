"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadFile } from "@/lib/upload";

const milestoneSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    date: z.string(), // ISO date string
    mediaUrl: z.string().optional(),
    type: z.string().default("MILESTONE"),
    projectId: z.string().min(1, "Project ID is required"),
});

export async function createMilestone(prevState: any, formData: FormData) {
    // Extract file first to handle it separately or part of validation
    const file = formData.get("file") as File | null;
    let filePath = null;

    if (file && file.size > 0) {
        filePath = await uploadFile(file);
    }

    const validatedFields = milestoneSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        date: formData.get("date"),
        mediaUrl: formData.get("mediaUrl"),
        type: formData.get("type"),
        projectId: formData.get("projectId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Milestone.",
            success: false,
        };
    }

    const { title, description, date, mediaUrl, type, projectId } = validatedFields.data;

    try {
        await db.milestone.create({
            data: {
                title,
                description,
                date: new Date(date),
                mediaUrl,
                filePath, // Save the path
                type,
                projectId,
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Database Error: Failed to Create Milestone.",
            success: false,
        };
    }

    revalidatePath(`/projects/${projectId}`);
    return { message: "Milestone created successfully", success: true };
}

export async function deleteMilestone(id: string, projectId: string) {
    try {
        await db.milestone.delete({
            where: { id },
        });
        revalidatePath(`/projects/${projectId}`);
        return { message: "Milestone deleted successfully", success: true };
    } catch (error) {
        return { message: "Failed to delete milestone", success: false };
    }
}
