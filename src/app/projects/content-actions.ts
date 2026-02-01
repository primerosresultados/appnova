"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createContent(projectId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const mediaUrl = formData.get("mediaUrl") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const links = formData.get("links") as string;
    const publishDate = formData.get("publishDate") as string;

    try {
        await db.content.create({
            data: {
                title,
                type,
                description,
                mediaUrl,
                fileUrl,
                links,
                publishDate: publishDate ? new Date(publishDate) : null,
                projectId,
            }
        });
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to create content", error);
        return { success: false };
    }
}

export async function updateContent(contentId: string, projectId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const mediaUrl = formData.get("mediaUrl") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const links = formData.get("links") as string;
    const publishDate = formData.get("publishDate") as string;
    const status = formData.get("status") as string;

    try {
        await db.content.update({
            where: { id: contentId },
            data: {
                title,
                type,
                description,
                mediaUrl,
                fileUrl,
                links,
                status,
                publishDate: publishDate ? new Date(publishDate) : null,
            }
        });
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update content", error);
        return { success: false };
    }
}

export async function updateContentStatus(contentId: string, status: string, projectId: string) {
    try {
        await db.content.update({
            where: { id: contentId },
            data: { status }
        });
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteContent(contentId: string, projectId: string) {
    try {
        await db.content.delete({
            where: { id: contentId }
        });
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete content", error);
        return { success: false };
    }
}
