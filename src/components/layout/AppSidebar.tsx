"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, Settings, Command, Workflow, CreditCard, ListTodo, LogOut as KeyIcon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { getUserSession } from "@/app/actions/auth-actions";

const menuItems = [
  { href: "/", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/tasks", label: "Tareas", icon: ListTodo },
  { href: "/workflows", label: "Flujos de Trabajo", icon: Workflow },
  { href: "/finance", label: "Finanzas", icon: CreditCard },
  { href: "/settings", label: "Configuración", icon: Settings },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUserSession().then(setUser);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 border-r bg-sidebar/95 backdrop-blur-md border-border transition-transform duration-300",
        "md:translate-x-0 md:z-40",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center px-6 border-b border-border justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Command className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">Nova Partners</span>
          </div>
          {/* Mobile close button */}
          <button
            className="md:hidden p-2 hover:bg-accent rounded-md"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-12 transition-colors duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground")} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-border">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-sm font-medium border border-border overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.substring(0, 2).toUpperCase() || "..."
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-sm leading-none">{user?.name || "Cargando..."}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{user?.role || "..."}</span>
              </div>
            </div>
            <button
              onClick={async () => {
                const { logout } = await import('@/app/login/actions');
                await logout();
              }}
              className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
              title="Cerrar Sesión"
            >
              <KeyIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="md:hidden p-2 hover:bg-accent rounded-md"
      onClick={onClick}
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
