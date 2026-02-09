"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";

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

    // initialIsClient comes from the server and is consistent between SSR and client hydration
    const isClient = initialIsClient;
    const contentPadding = isClient ? '' : 'md:pl-72';

    return (
        <div className="min-h-screen bg-background text-foreground flex" suppressHydrationWarning>
            {!isClient && (
                <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            )}
            <div className={`flex-1 flex flex-col ${contentPadding} transition-all duration-300`}>
                <Header onMenuClick={() => setSidebarOpen(true)} isClient={isClient} />
                <main className={`flex-1 overflow-y-auto ${isProjectDetail ? 'p-0' : 'p-6 md:p-8 lg:p-10'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}

