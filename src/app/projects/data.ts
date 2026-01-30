"use server";

import { db } from "@/lib/db";

export async function getClientsForSelect() {
    const clients = await db.client.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: 'asc'
        }
    });
    return clients;
}
