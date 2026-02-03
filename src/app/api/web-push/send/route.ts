
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
const webpush = require('web-push');

webpush.setVapidDetails(
    'mailto:admin@novapartners.cl',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export async function POST(req: Request) {
    try {
        const { userId, title, body, url } = await req.json();

        const subscriptions = await db.pushSubscription.findMany({
            where: { userId }
        });

        if (subscriptions.length === 0) {
            return NextResponse.json({ message: "No subscriptions found" });
        }

        const payload = JSON.stringify({
            title: title || "Nova App Notification",
            body: body || "Tienes una nueva actualización.",
            url: url || "/dashboard",
            icon: "/logo-192.png"
        });

        const promises = subscriptions.map((sub: any) => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: JSON.parse(sub.keys)
            };
            return webpush.sendNotification(pushConfig, payload).catch((err: any) => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription expired, delete it
                    return db.pushSubscription.delete({ where: { id: sub.id } });
                }
                console.error("Error sending push:", err);
            });
        });

        await Promise.all(promises);

        return NextResponse.json({ success: true, count: subscriptions.length });
    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
