"use server";

import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { unstable_cache } from "next/cache";

// Cache notifications for 60 seconds
const getCachedNotifications = unstable_cache(
    async () => {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const [urgentTasks, recentPayments] = await Promise.all([
            db.task.findMany({
                where: {
                    status: { not: 'DONE' },
                    dueDate: {
                        lte: nextWeek,
                        gte: now
                    }
                },
                select: {
                    id: true,
                    title: true,
                    dueDate: true,
                    priority: true,
                    projectId: true,
                    project: { select: { name: true } }
                },
                take: 3,
                orderBy: { dueDate: 'asc' }
            }),
            db.transaction.findMany({
                where: {
                    type: 'INCOME',
                    status: 'COMPLETED'
                },
                select: {
                    id: true,
                    amount: true,
                    description: true,
                },
                take: 3,
                orderBy: { date: 'desc' }
            })
        ]);

        return { urgentTasks, recentPayments };
    },
    ['dashboard-notifications'],
    { revalidate: 60 }
);

export async function getDashboardNotifications() {
    try {
        const { urgentTasks, recentPayments } = await getCachedNotifications();

        const notifications = [
            ...urgentTasks.map(t => ({
                id: `task-${t.id}`,
                type: 'TASK',
                title: `Tarea próxima: ${t.title}`,
                description: `${t.project.name} - Vence ${formatDistanceToNow(new Date(t.dueDate!), { addSuffix: true, locale: es })}`,
                priority: t.priority,
                href: `/projects/${t.projectId}`
            })),
            ...recentPayments.map(p => ({
                id: `payment-${p.id}`,
                type: 'PAYMENT',
                title: `Pago recibido: $${p.amount.toLocaleString('es-CL')}`,
                description: p.description || 'Sin descripción',
                priority: 'LOW',
                href: '/finance'
            }))
        ];

        return { success: true, notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, notifications: [] };
    }
}

