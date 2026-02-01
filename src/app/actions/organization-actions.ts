"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getOrganizationSettings() {
    try {
        let org = await db.organization.findUnique({
            where: { id: "default" }
        });

        if (!org) {
            org = await db.organization.create({
                data: {
                    id: "default",
                    name: "Nova Partners",
                }
            });
        }
        return { success: true, data: org };
    } catch (error) {
        console.error("Error fetching organization settings:", error);
        return { success: false, error: "Failed to fetch settings" };
    }
}

export async function updateOrganizationSettings(data: {
    name?: string;
    logoUrl?: string;
    logoDarkUrl?: string;
    primaryColor?: string;
    sidebarColor?: string;
    sidebarTextColor?: string;
    borderRadius?: string;
}) {
    try {
        const org = await db.organization.upsert({
            where: { id: "default" },
            update: data,
            create: {
                id: "default",
                ...data
            }
        });

        revalidatePath("/");
        return { success: true, data: org };
    } catch (error) {
        console.error("Error updating organization settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
