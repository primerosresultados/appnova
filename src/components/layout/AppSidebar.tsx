"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, Settings, Command, Workflow, CreditCard, ListTodo, LogOut as KeyIcon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { getUserSession } from "@/app/actions/auth-actions";
import { getOrganizationSettings } from "@/app/actions/organization-actions";

const menuItems = [
  { href: "/", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/tasks", label: "Tareas", icon: ListTodo },
  { href: "/workflows", label: "Flujos de Trabajo", icon: Workflow },
  { href: "/finance", label: "Finanzas", icon: CreditCard },
  { href: "/clients", label: "Clientes", icon: Users },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [orgSettings, setOrgSettings] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getUserSession().then(setUser);
    getOrganizationSettings().then((res) => {
      if (res.success) setOrgSettings(res.data);
    });
  }, []);

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
        suppressHydrationWarning
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 border-r bg-sidebar/95 backdrop-blur-3xl border-border transition-transform duration-300 shadow-2xl md:shadow-none flex flex-col justify-between",
          "md:translate-x-0 md:z-40",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
        <div>
          <div className="flex h-24 items-center px-6 border-b border-border/50 justify-between">
            <div className="flex items-center gap-3">
              {mounted && orgSettings?.logoUrl ? (
                <div className="h-12 w-auto max-w-[150px] flex items-center justify-start overflow-hidden">
                  {/* Simple dark/light mode logic for logo handled via CSS or just rendering one if universal */}
                  <img
                    src={orgSettings.logoUrl}
                    alt="Logo"
                    className="h-full w-full object-contain dark:hidden"
                  />
                  <img
                    src={orgSettings.logoDarkUrl || orgSettings.logoUrl}
                    alt="Logo"
                    className="h-full w-full object-contain hidden dark:block"
                  />
                </div>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Command className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-xl tracking-tight leading-none" style={{ color: 'var(--sidebar-muted-custom, inherit)' }}>NOVA</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--sidebar-muted-custom, var(--muted-foreground))' }}>Partners</span>
                  </div>
                </>
              )}

            </div>
            {/* Mobile close button */}
            <button
              className="md:hidden p-2 hover:bg-accent rounded-md"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="py-6 px-4 space-y-2">
            {menuItems.filter(item => {
              if (user?.role === 'CLIENTE') {
                // Clients strictly see NONE of the main admin/internal navigation
                // They will navigate via the top project selector
                return false;
              }
              return true;
            }).map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/"
                ? pathname === "/" || pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={cn(
                    "flex items-center w-full gap-4 h-12 px-4 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-[var(--sidebar-muted-custom,var(--muted-foreground))] hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                  )}
                  <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-[var(--sidebar-muted-custom,var(--muted-foreground))] opacity-70 group-hover:text-foreground")} />
                  <span className={cn("font-bold tracking-wide", isActive ? "text-primary-foreground" : "")}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="w-full">
          {/* Settings Link Separated */}
          {user?.role !== 'CLIENTE' && (
            <div className="px-4 pb-4">
              <Link
                href="/settings"
                onClick={() => onClose?.()}
                className={cn(
                  "flex items-center w-full gap-4 h-12 px-4 rounded-xl transition-all duration-200 group hover:bg-accent/50 hover:text-foreground mb-2",
                  !pathname.startsWith("/settings") && "text-[var(--sidebar-muted-custom,var(--muted-foreground))]",
                  pathname.startsWith("/settings") && "bg-accent text-accent-foreground"
                )}
              >
                <Settings className={cn("h-5 w-5 transition-transform group-hover:rotate-45")} />
                <span className="font-bold tracking-wide">Configuración</span>
              </Link>
            </div>
          )}

          <div className="p-6 border-t border-border bg-sidebar/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-sidebar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    user?.name?.substring(0, 2).toUpperCase() || "NO"
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-sm leading-none group-hover:text-primary transition-colors">{user?.name || "Cargando..."}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{user?.role || "..."}</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  const { logout } = await import('@/app/login/actions');
                  await logout();
                }}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors group"
                title="Cerrar Sesión"
              >
                <KeyIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </button>
            </div>
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
