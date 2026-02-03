"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { toast } from "react-hot-toast";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function NotificationToggle() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((subscription) => {
                    setIsSubscribed(!!subscription);
                });
            });
        }
    }, []);

    const subscribeUser = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidPublicKey) {
                toast.error("VAPID Key not configured");
                return;
            }

            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            await fetch('/api/web-push/subscribe', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            setIsSubscribed(true);
            toast.success("Notificaciones activadas");
        } catch (error) {
            console.error("Failed to subscribe", error);
            toast.error("Error al activar notificaciones");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return null;
    }

    if (!('serviceWorker' in navigator)) {
        return null;
    }

    if (isSubscribed) {
        return (
            <Button variant="ghost" size="icon" disabled title="Notificaciones activas">
                <Bell className="h-4 w-4 text-emerald-500" />
            </Button>
        );
    }

    return (
        <Button variant="ghost" size="icon" onClick={subscribeUser} disabled={loading} title="Activar notificaciones">
            {loading ? <Bell className="h-4 w-4 animate-pulse" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
        </Button>
    );
}
