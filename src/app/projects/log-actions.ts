"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const logSchema = z.object({
    projectId: z.string(),
    content: z.string().min(1, "Message is required"),
    type: z.string().default("NOTE"),
});

export async function addActionLog(prevState: any, formData: FormData) {
    const validatedFields = logSchema.safeParse({
        projectId: formData.get("projectId"),
        content: formData.get("content"),
        type: formData.get("type"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Failed to add log.",
            success: false,
        };
    }

    const { projectId, content, type } = validatedFields.data;

    // Mock User ID for now (Assuming first user or creating one if needed, or just null if strictly following schema)
    // Since we don't have Auth, we will treat 'User' as optional in logic or hardcode if we had a seeded user.
    // The schema allows userId to be null, so we'll leave it null for now, or fetch a "default" admin.
    // Ideally, we would fetch session here.

    try {
        // Try to find a default user to attribute
        const user = await db.user.findFirst();

        await db.actionLog.create({
            data: {
                projectId,
                content,
                type,
                userId: user?.id, // Attribute to first found user or null
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
