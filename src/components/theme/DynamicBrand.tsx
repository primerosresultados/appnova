"use client";

import { useEffect } from "react";
import { getContrastColor, adjustColorBrightness } from "@/lib/theme-utils";

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

            if (primaryColor.startsWith("#")) {
                const foreground = getContrastColor(primaryColor);
                root.style.setProperty("--primary-foreground", foreground);
                root.style.setProperty("--ring", primaryColor);
            }
        }

        if (sidebarColor) {
            root.style.setProperty("--sidebar", sidebarColor);

            if (sidebarColor.startsWith("#")) {
                const sidebarFg = getContrastColor(sidebarColor);
                root.style.setProperty("--sidebar-foreground", sidebarFg);
                root.style.setProperty("--sidebar-primary", sidebarFg === '#ffffff' ? '#ffffff' : '#000000');
                root.style.setProperty("--sidebar-primary-foreground", sidebarColor);
                root.style.setProperty("--sidebar-accent", adjustColorBrightness(sidebarColor, sidebarFg === '#ffffff' ? 10 : -5));
                root.style.setProperty("--sidebar-accent-foreground", sidebarFg);
                root.style.setProperty("--sidebar-border", adjustColorBrightness(sidebarColor, sidebarFg === '#ffffff' ? 15 : -10));
            }
        }

        if (sidebarTextColor) {
            root.style.setProperty("--sidebar-muted-custom", sidebarTextColor);
            root.style.setProperty("--sidebar-foreground", sidebarTextColor);
        }

        if (borderRadius) {
            root.style.setProperty("--radius", borderRadius);
        }
    }, [primaryColor, sidebarColor, sidebarTextColor, borderRadius]);

    return null;
}
