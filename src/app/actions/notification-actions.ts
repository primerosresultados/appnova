"use server";

import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export async function getDashboardNotifications() {
    try {
        // 1. Pending tasks with close deadlines (next 7 days)
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const urgentTasks = await db.task.findMany({
            where: {
                status: { not: 'DONE' },
                dueDate: {
                    lte: nextWeek,
                    gte: now
                }
            },
            include: {
                project: true
            },
            take: 3,
            orderBy: { dueDate: 'asc' }
        });

        // 2. Recent payments (last 5 transactions of type INCOME)
        const recentPayments = await db.transaction.findMany({
            where: {
                type: 'INCOME',
                status: 'COMPLETED'
            },
            take: 3,
            orderBy: { date: 'desc' }
        });

        // Map to a common format
        const notifications = [
            ...urgentTasks.map(t => ({
                id: `task-${t.id}`,
                type: 'TASK',
                title: `Tarea próxima: ${t.title}`,
                description: `${t.project.name} - Vence ${formatDistanceToNow(new Date(t.dueDate!), { addSuffix: true, locale: es })}`,
                priority: t.priority
            })),
            ...recentPayments.map(p => ({
                id: `payment-${p.id}`,
                type: 'PAYMENT',
                title: `Pago recibido: $${p.amount.toLocaleString('es-CL')}`,
                description: p.description || 'Sin descripción',
                priority: 'LOW'
            }))
        ];

        return { success: true, notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, notifications: [] };
    }
}
