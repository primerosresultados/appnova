"use server";

import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { unstable_cache } from "next/cache";

const getCachedUsers = unstable_cache(
    async () => {
        return db.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                clientId: true,
            },
            orderBy: { name: 'asc' }
        });
    },
    ['users-list-settings'],
    { revalidate: 60 }
);

export async function getUsers() {
    try {
        return await getCachedUsers();
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
    const password = formData.get("password") as string;

    if (!id || !name || !email) {
        return { success: false, message: "Faltan campos requeridos" };
    }

    try {
        // 1. Update in Supabase Auth
        // Ensure we have the key
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Cannot update Auth user.");
            if (password) {
                // If trying to update password but no key, this is a critical failure for that specific action
                return { success: false, message: "Error de configuración: No se puede actualizar contraseña (Falta Key)" };
            }
        }

        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabaseAdmin = createAdminClient();

            // Find by ID match or Email match? Our User ID is local UUID.
            // Best effort: Match by currentEmail
            const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            const authUser = users?.users.find(u => u.email === currentEmail);

            if (authUser) {
                const updateData: any = {
                    email: email,
                    user_metadata: { full_name: name }
                };

                // Only update password if provided
                if (password) {
                    updateData.password = password;
                }

                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                    authUser.id,
                    updateData
                );

                if (updateError) {
                    console.error("Supabase Auth Update Error:", updateError);
                    return { success: false, message: `Error al actualizar Auth: ${updateError.message}` };
                }
            } else {
                console.warn("Auth user not found for email:", currentEmail);
                if (password) {
                    return { success: false, message: "No se encontró el usuario en Auth para cambiar contraseña" };
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

