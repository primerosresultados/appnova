"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { getUserSession } from "@/app/actions/auth-actions";

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkUserRole = async () => {
            try {
                const user = await getUserSession();
                setIsClient(user?.role === 'CLIENTE');
            } catch (error) {
                console.error("Failed to fetch user session", error);
                setIsClient(false);
            } finally {
                setLoading(false);
            }
        };
        checkUserRole();
    }, []);

    if (isLoginPage) {
        return <>{children}</>;
    }

    // Prevent hydration mismatch by not rendering sidebar logic until mounted
    // OR we can render a default skeleton. For now, to suffice the error, we'll wait for mount
    // to apply the specific role-based layout, although this might cause a layout shift.
    // Better: Render the default (Admin) layout on server, and then adjust on client.
    // The issue is likely suppressHydrationWarning. I will remove it.

    return (
        <div className="min-h-screen bg-background text-foreground flex" suppressHydrationWarning>
            {/* 
              Only render Sidebar if we're not a client.
              To avoid hydration error, we need to ensure the initial render matches server.
              Server: isClient = false. Sidebar Renders.
              Client Initial: isClient = false. Sidebar Renders.
              Client Effect: isClient might become true. Sidebar dissapears.
              This is valid React. The error likely comes from bad nesting or attributes.
            */}
            {!isClient && <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
            <div className={`flex-1 flex flex-col ${!isClient ? 'md:pl-72' : ''} transition-all duration-300`}>
                <Header onMenuClick={() => setSidebarOpen(true)} isClient={isClient} />
                <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
