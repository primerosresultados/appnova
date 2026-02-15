"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";

// Dynamic import with no SSR — completely avoids hydration mismatch
// for the sidebar, since browser extensions can inject DOM nodes
// that offset React's child reconciliation.
const AppSidebar = dynamic(
    () => import("@/components/layout/AppSidebar").then(mod => ({ default: mod.AppSidebar })),
    { ssr: false }
);

interface MainLayoutProps {
    children: React.ReactNode;
    initialIsClient?: boolean;
}

export function MainLayout({ children, initialIsClient = false }: MainLayoutProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const isProjectDetail = pathname.startsWith("/projects/") && pathname.split("/").length > 2;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (isLoginPage) {
        return <>{children}</>;
    }

    const isClient = initialIsClient;

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {!isClient && (
                <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            )}
            <div className={`flex-1 flex flex-col ${isClient ? '' : 'md:pl-72'} transition-all duration-300`}>
                <Header onMenuClick={() => setSidebarOpen(true)} isClient={isClient} />
                <main className={`flex-1 overflow-y-auto ${isProjectDetail ? 'p-0' : 'p-6 md:p-8 lg:p-10'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
