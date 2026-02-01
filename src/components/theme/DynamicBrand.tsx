"use client";

import { useEffect, useState } from "react";
import { getOrganizationSettings } from "@/app/actions/organization-actions";

export function DynamicBrand() {
    const [primaryColor, setPrimaryColor] = useState<string | null>(null);
    const [sidebarColor, setSidebarColor] = useState<string | null>(null);
    const [sidebarTextColor, setSidebarTextColor] = useState<string | null>(null);
    const [borderRadius, setBorderRadius] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, success } = await getOrganizationSettings();
                if (success) {
                    if (data?.primaryColor) setPrimaryColor(data.primaryColor);
                    if (data?.sidebarColor) setSidebarColor(data.sidebarColor);
                    if (data?.sidebarTextColor) setSidebarTextColor(data.sidebarTextColor);
                    if (data?.borderRadius) setBorderRadius(data.borderRadius);
                }
            } catch (error) {
                console.error("Failed to fetch brand settings:", error);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        if (primaryColor) {
            root.style.setProperty("--primary", primaryColor);
            root.style.setProperty("--ring", primaryColor);
        }

        if (sidebarColor) {
            root.style.setProperty("--sidebar", sidebarColor);
        }

        if (sidebarTextColor) {
            root.style.setProperty("--sidebar-muted-custom", sidebarTextColor);
        }

        if (borderRadius) {
            root.style.setProperty("--radius", borderRadius);
        }
    }, [primaryColor, sidebarColor, sidebarTextColor, borderRadius]);

    return null;
}
