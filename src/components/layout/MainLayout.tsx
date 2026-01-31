"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar, MobileMenuButton } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col md:pl-64">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
