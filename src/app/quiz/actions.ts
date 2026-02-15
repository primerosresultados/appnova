"use server";

import { db } from "@/lib/db";

export async function submitQuizProspect(data: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    answers: Record<string, string>;
}) {
    try {
        if (!data.name?.trim()) {
            return { success: false, message: "El nombre es requerido" };
        }

        // Build notes from quiz answers
        const answerLines = Object.entries(data.answers)
            .map(([q, a]) => `${q}: ${a}`)
            .join("\n");

        await db.prospect.create({
            data: {
                name: data.name.trim(),
                email: data.email || null,
                phone: data.phone || null,
                company: data.company || null,
                source: "Quiz Web",
                status: "NUEVO",
                notes: answerLines || null,
            },
        });

        return { success: true, message: "¡Gracias! Nos pondremos en contacto contigo pronto." };
    } catch (error: any) {
        console.error("[submitQuizProspect] Error:", error?.message);
        return { success: false, message: "Error al enviar. Intenta nuevamente." };
    }
}
