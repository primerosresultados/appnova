"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Quick date-move action for calendar drag-and-drop.
 * Moves milestones, tasks, or content to a new date.
 */
export async function moveCalendarEvent(
    eventId: string,
    eventKind: "MILESTONE" | "TASK" | "CONTENT",
    newDate: string, // ISO date string
    projectId: string
) {
    try {
        const dateObj = new Date(newDate);

        if (eventKind === "MILESTONE") {
            await db.milestone.update({
                where: { id: eventId },
                data: { date: dateObj },
            });
        } else if (eventKind === "TASK") {
            await db.task.update({
                where: { id: eventId },
                data: { dueDate: dateObj },
            });
        } else if (eventKind === "CONTENT") {
            await db.content.update({
                where: { id: eventId },
                data: { publishDate: dateObj },
            });
        }

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error moving event:", error);
        return { success: false, message: "Error al mover el evento." };
    }
}
