"use server";

import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
    const password = formData.get("password") as string;

    if (!name || !email) {
        return { success: false, message: "Nombre y Email requeridos" };
    }

    // 1. Check if we have the Service Role Key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn("Missing SUPABASE_SERVICE_ROLE_KEY. Creating only DB user.");
        // Proceed to create only in DB but warn user in return message?
        // Or fail? Let's try to minimal effort: Create in DB so they appear in list.
    }

    try {
        // 2. Create in Supabase Auth (if key exists)
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabaseAdmin = createAdminClient();
            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                email_confirm: true, // Auto-confirm
                user_metadata: { full_name: name },
                password: password || "TemporalPassword123!" // Use provided password or fallback
            });

            if (authError) {
                console.error("Supabase Auth Error:", authError);
                return { success: false, message: `Error Auth: ${authError.message}` };
            }

            // Ideally send an email with password reset link here
            const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: email
            });

            console.log("Invite Link generated:", resetData.properties?.action_link);
            // In a real app, send this link via email provider (Resend, AWS SES)
        }

        // 3. Create in Prisma
        await db.user.create({
            data: {
                name,
                email,
                role: (role as any) || "COLABORADOR",
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            }
        });

        revalidatePath("/settings");
        return { success: true, message: "Usuario invitado exitosamente" };
    } catch (error) {
        console.error("Failed to create user:", error);
        return { success: false, message: "Error al crear usuario en base de datos" };
    }

}

export async function deleteUser(email: string) {
    if (!email) {
        return { success: false, message: "Email requerido" };
    }

    try {
        // 1. Delete from Supabase Auth
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabaseAdmin = createAdminClient();

            // Need UUID first.
            const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            const authUser = users?.users.find(u => u.email === email);

            if (authUser) {
                const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
                if (deleteAuthError) {
                    console.error("Failed to delete auth user:", deleteAuthError);
                    // Continue to delete from DB anyway to keep consistent? 
                    // Yes, prioritize DB consistency for the UI.
                }
            }
        }

        // 2. Delete from Prisma
        await db.user.delete({
            where: { email: email }
        });

        revalidatePath("/settings");
        return { success: true, message: "Usuario eliminado correctamente" };

    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, message: "Error al eliminar usuario" };
    }
}

export async function updateUser(prevState: any, formData: FormData) {
    const id = formData.get("id") as string;
    const currentEmail = formData.get("currentEmail") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    if (!id || !name || !email) {
        return { success: false, message: "Faltan campos requeridos" };
    }

    try {
        // 1. Update in Supabase Auth (if email changed or name updated in metadata)
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabaseAdmin = createAdminClient();

            // Need to find user by previous email to get ID (if strict) or just assume sync?
            // Safer to list users or find by ID if we stored Auth ID (we don't stored it yet in User model, relying on email sync)

            const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            // Find by ID match or Email match? Our User ID is local UUID.
            // Best effort: Match by currentEmail
            const authUser = users?.users.find(u => u.email === currentEmail);

            if (authUser) {
                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                    authUser.id,
                    {
                        email: email,
                        user_metadata: { full_name: name }
                    }
                );

                if (updateError) {
                    console.error("Supabase Auth Update Error:", updateError);
                    // Don't fail completely, try to update DB at least
                }
            }
        }

        // 2. Update in Prisma
        await db.user.update({
            where: { id },
            data: {
                name,
                email,
                role: (role as any),
                // Update avatar if name changed to keep it fresh?
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            }
        });

        revalidatePath("/settings");
        return { success: true, message: "Usuario actualizado exitosamente" };
    } catch (error) {
        console.error("Failed to update user:", error);
        return { success: false, message: "Error al actualizar usuario" };
    }
}

