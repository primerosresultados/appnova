"use client";

import { useEffect, useState } from "react";
// import { Progress } from "@/components/ui/progress"; // Removed unused
import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Coffee, Flame, Siren, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeadlineProgressProps {
    createdAt: Date | string;
    dueDate: Date | string | null;
    status: string;
}

export function DeadlineProgress({ createdAt, dueDate, status }: DeadlineProgressProps) {
    const [progress, setProgress] = useState(0);

    // If no due date or task is done, don't show urgency bar in the same way
    if (!dueDate || status === 'DONE') return null;

    const start = new Date(createdAt).getTime();
    const end = new Date(dueDate).getTime();
    const now = new Date().getTime();

    // Calculate percentage of time elapsed
    const totalDuration = end - start;
    const elapsed = now - start;

    // Clamp between 0 and 100
    const rawPercentage = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100;
    const percentage = Math.min(Math.max(rawPercentage, 0), 100);

    const daysLeft = differenceInDays(end, now);
    const isOverdue = now > end;

    // Determine State
    let state = "CHILL"; // 0-50%
    if (isOverdue) state = "OVERDUE";
    else if (percentage > 85) state = "PANIC"; // > 85%
    else if (percentage > 50) state = "HUSTLE"; // 50-85%

    // Config based on state
    const config = {
        CHILL: {
            color: "bg-emerald-500",
            icon: Coffee,
            message: "Todo tranquilo. Tómate un café ☕",
            textColor: "text-emerald-500"
        },
        HUSTLE: {
            color: "bg-amber-500",
            icon: Flame,
            message: "A ponerle bueno 🔥",
            textColor: "text-amber-500"
        },
        PANIC: {
            color: "bg-rose-600",
            icon: Siren,
            message: "PÁNICO TOTAL 🚨",
            textColor: "text-rose-600"
        },
        OVERDUE: {
            color: "bg-purple-600",
            icon: Skull,
            message: "Estás en tiempo prestado 💀",
            textColor: "text-purple-600"
        }
    };

    const currentConfig = config[state as keyof typeof config];
    const Icon = currentConfig.icon;

    return (
        <div className="space-y-2 mb-6 p-4 rounded-xl bg-secondary/10 border border-border/30">
            <div className="flex justify-between items-center text-sm font-medium mb-1">
                <div className={cn("flex items-center gap-2", currentConfig.textColor)}>
                    <Icon className="h-4 w-4 animate-pulse" />
                    <span>{currentConfig.message}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                    {isOverdue
                        ? `Venció hace ${Math.abs(daysLeft)} días`
                        : `${daysLeft} días restantes`}
                </span>
            </div>

            <div className="h-3 w-full bg-secondary/30 rounded-full overflow-hidden relative">
                {/* Background stripes for texture */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,#000_25%,#000_50%,transparent_50%,transparent_75%,#000_75%,#000_100%)] bg-[length:1rem_1rem]" />

                <div
                    className={cn("h-full transition-all duration-1000 ease-out relative", currentConfig.color)}
                    style={{ width: `${isOverdue ? 100 : percentage}%` }}
                >
                    {/* Shimmer effect for high urgency */}
                    {(state === 'PANIC' || state === 'OVERDUE') && (
                        <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12" />
                    )}
                </div>
            </div>
        </div>
    );
}
