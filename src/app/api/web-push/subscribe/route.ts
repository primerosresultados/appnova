
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserSession } from "@/app/actions/auth-actions";

export async function POST(req: Request) {
    try {
        const user = await getUserSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const subscription = await req.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
        }

        await db.pushSubscription.create({
            data: {
                userId: user.id,
                endpoint: subscription.endpoint,
                keys: JSON.stringify(subscription.keys),
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving subscription:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
