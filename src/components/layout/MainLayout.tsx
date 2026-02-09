"use client";

import { useEffect, useState } from "react";
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (isLoginPage) {
        return <>{children}</>;
    }

    // Use initialIsClient only after mounting to avoid hydration mismatch
    const isClient = mounted ? initialIsClient : false;

    // Calculate padding class - default to admin layout (with padding) on server
    // This ensures consistent rendering between server and client
    const contentPadding = mounted && isClient ? '' : 'md:pl-72';

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Only render sidebar for non-client users after mounting */}
            {mounted && !isClient && (
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

