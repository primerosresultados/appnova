"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { getUserSession } from "@/app/actions/auth-actions";

interface MainLayoutProps {
    children: React.ReactNode;
    initialIsClient?: boolean;
}

export function MainLayout({ children, initialIsClient = false }: MainLayoutProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    // Check if it's a project detail page (e.g. /projects/123) but not /projects or /projects/new if applicable
    // Identifying strictly by ID pattern helps, but length > 2 is a good proxy: "", "projects", "id" -> length 3
    const isProjectDetail = pathname.startsWith("/projects/") && pathname.split("/").length > 2;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isClient, setIsClient] = useState(initialIsClient);
    const [loading, setLoading] = useState(!initialIsClient);
    const [mounted, setMounted] = useState(false); // Track mounting for hydration fix

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const user = await getUserSession();
                // Explicitly check for CLIENTE role. Any other role is considered "Internal" which sees sidebar.
                // We use optional chaining and safe string comparison
                const role = user?.role;
                const isClientUser = role === 'CLIENTE';

                // If user is Admin/Internal, enforce isClient = false
                if (role && role !== 'CLIENTE') {
                    setIsClient(false);
                } else {
                    setIsClient(isClientUser);
                }
            } catch (error) {
                console.error("Failed to fetch user session", error);
                // If error, default to internal view (sidebar visible) unless we know otherwise?
                // Better safe than sorry: if logged in but error, maybe show sidebar.
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
              Only render Sidebar if we're not a client AND we are mounted.
              This prevents hydration errors by ensuring we only render this client-dependent component
              after the specific client environment is ready.
            */}
            {mounted && !isClient && <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
            <div className={`flex-1 flex flex-col ${!isClient ? 'md:pl-72' : ''} transition-all duration-300`}>
                <Header onMenuClick={() => setSidebarOpen(true)} isClient={isClient} />
                <main className={`flex-1 overflow-y-auto ${isProjectDetail ? 'p-0' : 'p-6 md:p-8 lg:p-10'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
