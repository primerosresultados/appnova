"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";

interface CompletedTasksCollapsibleProps {
    count: number;
    children: ReactNode;
}

export function CompletedTasksCollapsible({ count, children }: CompletedTasksCollapsibleProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-border/50 rounded-xl bg-card/50 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all"
            >
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-medium">
                    Completadas ({count})
                </span>
            </button>
            {isOpen && (
                <div className="grid gap-2 p-3 pt-0 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}
