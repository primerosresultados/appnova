"use client";

import { useEffect, useState } from "react";
import { Bell, Clock, DollarSign } from "lucide-react";
import { getDashboardNotifications } from "@/app/actions/notification-actions";
import Link from "next/link";

export function NotificationCarousel() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const result = await getDashboardNotifications();
                if (result.success) {
                    setNotifications(result.notifications);
                    setError(false);
                }
            } catch (e) {
                console.error("Error loading notifications:", e);
                setError(true);
            }
        };
        fetchNotifications();

        // Refresh every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (notifications.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % notifications.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [notifications.length]);

    if (error || notifications.length === 0) return null;

    const current = notifications[currentIndex];

    const getIcon = (type: string) => {
        switch (type) {
            case 'TASK': return <Clock className="h-3.5 w-3.5 text-amber-500" />;
            case 'PAYMENT': return <DollarSign className="h-3.5 w-3.5 text-emerald-500" />;
            default: return <Bell className="h-3.5 w-3.5 text-primary" />;
        }
    };

    return (
        <Link href={current.href || '#'} className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-accent/30 rounded-full border border-border/50 flex-1 max-w-md overflow-hidden hover:bg-accent/50 transition-colors">
            <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border/50 shadow-sm">
                {getIcon(current.type)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-col transition-opacity duration-200">
                    <span className="text-[11px] font-bold truncate leading-tight">
                        {current.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate leading-tight">
                        {current.description}
                    </span>
                </div>
            </div>

            <div className="flex gap-1 shrink-0">
                {notifications.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-3 bg-primary' : 'w-1 bg-primary/20'}`}
                    />
                ))}
            </div>
        </Link>
    );
}
