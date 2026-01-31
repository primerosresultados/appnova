"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, Settings, Bell, Search, Command, Workflow, CreditCard, ListTodo, LogOut as KeyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/tasks", label: "Tareas", icon: ListTodo },
  { href: "/workflows", label: "Flujos de Trabajo", icon: Workflow },
  { href: "/finance", label: "Finanzas", icon: CreditCard },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar/80 backdrop-blur-md border-border transition-transform hidden md:block">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Command className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">Nova Partners</span>
        </div>
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
                  "w-full justify-start gap-3 h-11 transition-colors duration-200",
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
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-sm font-medium">
              AD
            </div>
            <div className="text-sm">
              <p className="font-medium">Admin</p>
              <p className="text-xs text-muted-foreground">Super User</p>
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
    </aside >
  );
}
