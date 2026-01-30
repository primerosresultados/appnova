"use server";

import { db } from "@/lib/db";

export async function getUsers() {
    try {
        const users = await db.user.findMany({
            orderBy: { name: 'asc' }
        });
        return users;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}

export async function createUser(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    if (!name || !email) {
        return { success: false, message: "Nombre y Email requeridos" };
    }

    try {
        await db.user.create({
            data: {
                name,
                email,
                role: role || "MEMBER",
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            }
        });

        // Revalidate? We will handle state in client or revalidate page
        return { success: true, message: "Usuario creado" };
    } catch (error) {
        console.error("Failed to create user:", error);
        return { success: false, message: "Error al crear usuario" };
    }
}
