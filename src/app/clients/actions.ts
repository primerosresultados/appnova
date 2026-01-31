"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const ClientSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    company: z.string().optional(),
    website: z.string().optional(),
    industry: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    taxId: z.string().optional(),
    billingAddress: z.string().optional(),
    billingEmail: z.string().email().optional().or(z.literal("")),
    status: z.enum(["ACTIVE", "INACTIVE", "LEAD"]).default("ACTIVE"),
});

export async function createClient(prevState: any, formData: FormData) {
    const validatedFields = ClientSchema.safeParse({
        name: formData.get("name"),
        company: formData.get("company") || undefined,
        website: formData.get("website") || undefined,
        industry: formData.get("industry") || undefined,
        taxId: formData.get("taxId") || undefined,
        status: formData.get("status") || "ACTIVE",
    });


    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Client.",
        };
    }

    const { name, company, website, industry, taxId, status } = validatedFields.data;

    try {
        await db.client.create({
            data: {
                name,
                company,
                website,
                industry,
                taxId,
                status: status as any,
            },
        });
    } catch (error) {
        return {
            message: "Database Error: Failed to Create Client.",
        };
    }

    revalidatePath("/clients");
    return { message: "Client created successfully", success: true };
}

export async function updateClient(prevState: any, formData: FormData) {
    const id = formData.get("id") as string;

    if (!id) {
        return { message: "Missing Client ID" };
    }

    const validatedFields = ClientSchema.safeParse({
        name: formData.get("name"),
        company: formData.get("company"),
        website: formData.get("website"),
        industry: formData.get("industry"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        taxId: formData.get("taxId"),
        billingAddress: formData.get("billingAddress"),
        billingEmail: formData.get("billingEmail"),
        status: formData.get("status"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation Error.",
        };
    }

    const data = validatedFields.data;

    try {
        await db.client.update({
            where: { id },
            data: {
                ...data,
                status: data.status as any,
                // Handle empty strings as nulls if needed, though Schema handles optional
            },
        });
    } catch (error) {
        return {
            message: "Database Error: Failed to Update Client.",
        };
    }

    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    return { message: "Client updated successfully", success: true };
}

export async function createFinancialRecord(clientId: string, data: any) {
    try {
        await db.financialRecord.create({
            data: {
                clientId,
                amount: parseFloat(data.amount),
                type: data.type,
                description: data.description,
                date: new Date(data.date),
                status: data.status,
            }
        });
        revalidatePath(`/clients/${clientId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to create financial record:", error);
        return { success: false, error: "Error al crear el registro financiero" };
    }
}

export async function deleteClient(id: string) {
    try {
        await db.client.delete({
            where: { id },
        });
        revalidatePath("/clients");
        return { message: "Client deleted successfully", success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Failed to delete client", success: false };
    }
}

export async function grantClientAccess(prevState: any, formData: FormData) {
    const clientId = formData.get("clientId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!clientId || !name || !email) {
        return { success: false, message: "Faltan campos requeridos" };
    }

    try {
        // 1. Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { success: false, message: "Ya existe un usuario con este correo." };
        }

        // 2. Create User linked to Client
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const { createAdminClient } = await import("@/lib/supabase/admin");
            const supabaseAdmin = createAdminClient();

            const { error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                email_confirm: true,
                user_metadata: { full_name: name },
                password: password || "TemporalPassword123!"
            });

            if (authError) {
                console.error("Supabase Auth Error:", authError);
                return { success: false, message: `Error Auth: ${authError.message}` };
            }
        }

        await db.user.create({
            data: {
                name,
                email,
                role: 'CLIENTE',
                client: {
                    connect: { id: clientId }
                },
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            } as any
        });

        revalidatePath("/clients");
        return { success: true, message: "Usuario creado y acceso concedido." };

    } catch (error) {
        console.error("Error granting access:", error);
        return { success: false, message: "Error al conceder acceso." };
    }
}
