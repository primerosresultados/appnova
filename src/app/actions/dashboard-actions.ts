"use server";

import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

// Cache dashboard stats for 60 seconds
const getCachedDashboardStats = unstable_cache(
    async (period: string) => {
        try {
            let startDate: Date | undefined;
            const now = new Date();

            switch (period) {
                case '7d':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case '30d':
                    startDate = new Date(now.setDate(now.getDate() - 30));
                    break;
                case '90d':
                    startDate = new Date(now.setDate(now.getDate() - 90));
                    break;
                case '12m':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
                case 'all':
                    startDate = undefined;
                    break;
                default:
                    startDate = new Date(now.setDate(now.getDate() - 30)); // Default 30d
            }

            const dateFilter = startDate ? {
                createdAt: { gte: startDate }
            } : {};

            const transactionDateFilter = startDate ? {
                date: { gte: startDate }
            } : {};

            const [totalProjects, activeClients, totalIncome, incomeByCategory, totalIncomeEntries] = await Promise.all([
                db.project.count({
                    where: {
                        status: { not: 'COMPLETED' },
                        ...dateFilter
                    }
                }),
                db.client.count({ where: { status: 'ACTIVE' } }), // Active clients usually doesn't obey time filter unless "New active clients"
                db.transaction.aggregate({
                    _sum: { amount: true },
                    where: {
                        type: 'INCOME',
                        ...transactionDateFilter
                    }
                }),
                db.transaction.groupBy({
                    by: ['category'],
                    _sum: { amount: true },
                    where: {
                        type: 'INCOME',
                        ...transactionDateFilter
                    }
                }),
                db.transaction.findMany({
                    where: {
                        type: 'INCOME',
                        ...transactionDateFilter
                    },
                    orderBy: { date: 'asc' },
                    // take: 30, // Remove take limit if we are filtering by date range mostly
                    select: { date: true, amount: true }
                })
            ]);

            // Process data for chart
            const chartData = totalIncomeEntries.map(entry => ({
                name: new Date(entry.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
                value: entry.amount
            }));

            return {
                totalProjects,
                activeClients,
                totalIncome: totalIncome._sum.amount || 0,
                incomeByCategory,
                chartData: chartData.length > 0 ? chartData : [
                    { name: 'Mon', value: 0 },
                    { name: 'Tue', value: 0 },
                    { name: 'Wed', value: 0 },
                    { name: 'Thu', value: 0 },
                    { name: 'Fri', value: 0 },
                    { name: 'Sat', value: 0 },
                    { name: 'Sun', value: 0 },
                ]
            };
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
            return {
                totalProjects: 0,
                activeClients: 0,
                totalIncome: 0,
                incomeByCategory: [],
                chartData: []
            };
        }
    },
    ['dashboard-stats'],
    { revalidate: 60 } // Cache for 60 seconds
);

export async function getDashboardStats(period: string = '30d') {
    return getCachedDashboardStats(period);
}

export async function getAttentionItems() {
    try {
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        const [overdueTasks, pendingInvoices, urgentProjects] = await Promise.all([
            db.task.findMany({
                where: {
                    dueDate: { lt: now },
                    status: { notIn: ['DONE', 'COMPLETED', 'CANCELLED'] }
                },
                include: { project: true, assignee: true },
                take: 5,
                orderBy: { dueDate: 'asc' }
            }),
            db.transaction.findMany({
                where: {
                    type: 'INCOME',
                    status: 'PENDING'
                },
                take: 5,
                orderBy: { date: 'asc' }
            }),
            db.project.findMany({
                where: {
                    status: { not: 'COMPLETED' },
                    dueDate: {
                        gte: now,
                        lte: threeDaysFromNow
                    }
                },
                take: 5,
                orderBy: { dueDate: 'asc' }
            })
        ]);

        return {
            overdueTasks,
            pendingInvoices,
            urgentProjects
        };
    } catch (error) {
        console.error("Attention Items Error:", error);
        return {
            overdueTasks: [],
            pendingInvoices: [],
            urgentProjects: []
        };
    }
}
