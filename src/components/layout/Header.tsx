"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationCarousel } from "./NotificationCarousel";

export function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/50 px-6 backdrop-blur-xl transition-all">
            <div className="flex items-center gap-6">
                <div className="relative w-80 hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar clientes, proyectos..."
                        className="pl-9 bg-accent/30 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                </div>
                <NotificationCarousel />
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                </Button>
            </div>
        </header>
    );
}
