"use client";

import { useEffect } from "react";

interface DynamicBrandProps {
    primaryColor?: string | null;
    sidebarColor?: string | null;
    sidebarTextColor?: string | null;
    borderRadius?: string | null;
}

export function DynamicBrand({ primaryColor, sidebarColor, sidebarTextColor, borderRadius }: DynamicBrandProps) {
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

