"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";

// Cache org settings for 5 minutes - rarely changes, called on every page via DynamicBrand
const getCachedOrgSettings = unstable_cache(
    async () => {
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
        return org;
    },
    ['organization-settings'],
    { revalidate: 300, tags: ['organization-settings'] }
);

export async function getOrganizationSettings() {
    try {
        const data = await getCachedOrgSettings();
        return { success: true, data };
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
    primaryTextColor?: string;
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

        revalidateTag("organization-settings");
        revalidatePath("/");
        return { success: true, data: org };
    } catch (error) {
        console.error("Error updating organization settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
