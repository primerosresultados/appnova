"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserSession } from "@/app/actions/auth-actions";

const logSchema = z.object({
    projectId: z.string(),
    content: z.string().min(1, "Message is required"),
    type: z.string().default("NOTE"),
    isPublic: z.string().transform((val) => val === "true").optional(),
});

export async function addActionLog(prevState: any, formData: FormData) {
    const validatedFields = logSchema.safeParse({
        projectId: formData.get("projectId"),
        content: formData.get("content"),
        type: formData.get("type"),
        isPublic: formData.get("isPublic"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Failed to add log.",
            success: false,
        };
    }

    const { projectId, content, type, isPublic } = validatedFields.data;

    try {
        const user = await getUserSession();

        await db.actionLog.create({
            data: {
                projectId,
                content,
                type,
                userId: user?.id,
                isPublic: isPublic || false,
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
