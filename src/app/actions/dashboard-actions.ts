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

            const sevenDaysFromNow = new Date(now);
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

            const [totalProjects, activeProjects, activeClients, criticalTasks, totalTasks, completedTasks, totalIncome, incomeByCategory, totalIncomeEntries] = await Promise.all([
                db.project.count({
                    where: {
                        status: { not: 'COMPLETED' },
                        ...dateFilter
                    }
                }),
                db.project.count({
                    where: {
                        status: { in: ['IN_PROGRESS', 'REVIEW'] },
                        ...dateFilter
                    }
                }),
                db.client.count({ where: { status: 'ACTIVE' } }), // Active clients usually doesn't obey time filter unless "New active clients"
                db.task.count({
                    where: {
                        OR: [
                            { dueDate: { lt: now }, status: { notIn: ['DONE', 'COMPLETED'] } }, // Overdue
                            { dueDate: { lte: sevenDaysFromNow, gte: now }, priority: 'HIGH', status: { notIn: ['DONE', 'COMPLETED'] } } // High priority due soon
                        ]
                    }
                }),
                db.task.count({
                    where: {
                        ...dateFilter
                    }
                }),
                db.task.count({
                    where: {
                        status: { in: ['DONE', 'COMPLETED'] },
                        ...dateFilter
                    }
                }),
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

            // Calculate completion percentage
            const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            // Process data for chart
            const chartData = totalIncomeEntries.map(entry => ({
                name: new Date(entry.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
                value: entry.amount
            }));

            return {
                totalProjects,
                activeProjects,
                activeClients,
                criticalTasks,
                completionPercentage,
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
                activeProjects: 0,
                activeClients: 0,
                criticalTasks: 0,
                completionPercentage: 0,
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

// Cache attention items for 30 seconds
const getCachedAttentionItems = unstable_cache(
    async () => {
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        const [overdueTasks, pendingInvoices, urgentProjects] = await Promise.all([
            db.task.findMany({
                where: {
                    dueDate: { lt: now },
                    status: { notIn: ['DONE', 'COMPLETED', 'CANCELLED'] }
                },
                select: {
                    id: true,
                    title: true,
                    dueDate: true,
                    status: true,
                    priority: true,
                    project: { select: { id: true, name: true } },
                    assignee: { select: { id: true, name: true, avatar: true } }
                },
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
    },
    ['attention-items'],
    { revalidate: 30 }
);

export async function getAttentionItems() {
    try {
        return await getCachedAttentionItems();
    } catch (error) {
        console.error("Attention Items Error:", error);
        return {
            overdueTasks: [],
            pendingInvoices: [],
            urgentProjects: []
        };
    }
}

// Cache calendar events for 60 seconds
const getCachedCalendarEvents = unstable_cache(
    async () => {
        const now = new Date();
        const startFilter = new Date(now);
        startFilter.setMonth(now.getMonth() - 6);

        const [tasks, projects, contracts, contents, milestones, users] = await Promise.all([
            db.task.findMany({
                where: {
                    dueDate: {
                        not: null,
                        gte: startFilter
                    }
                },
                select: {
                    id: true,
                    title: true,
                    dueDate: true,
                    status: true,
                    assignee: { select: { id: true, name: true } },
                    project: { select: { name: true } }
                }
            }),
            db.project.findMany({
                where: {
                    dueDate: {
                        not: null,
                        gte: startFilter
                    }
                },
                select: {
                    id: true,
                    name: true,
                    dueDate: true,
                    status: true,
                    client: { select: { name: true } }
                }
            }),
            db.contract.findMany({
                where: {
                    startDate: { gte: startFilter }
                },
                select: {
                    id: true,
                    title: true,
                    startDate: true,
                    endDate: true,
                    status: true,
                    client: { select: { name: true } }
                }
            }),
            db.content.findMany({
                where: {
                    publishDate: {
                        not: null,
                        gte: startFilter
                    }
                },
                select: {
                    id: true,
                    title: true,
                    publishDate: true,
                    status: true,
                    type: true,
                    project: { select: { name: true } }
                }
            }),
            db.milestone.findMany({
                where: {
                    date: { gte: startFilter }
                },
                select: {
                    id: true,
                    title: true,
                    date: true,
                    type: true,
                    project: { select: { name: true } }
                }
            }),
            db.user.findMany({
                select: { id: true, name: true }
            })
        ]);

        const events = [
            ...tasks.map(t => ({
                id: t.id,
                title: t.title,
                date: t.dueDate!,
                type: 'TASK' as const,
                status: t.status,
                assignee: t.assignee,
                project: t.project
            })),
            ...projects.map(p => ({
                id: p.id,
                title: p.name,
                date: p.dueDate!,
                type: 'PROJECT' as const,
                status: p.status,
                client: p.client
            })),
            ...contracts.map(c => ({
                id: c.id,
                title: c.title,
                date: c.startDate,
                type: 'CONTRACT' as const,
                status: c.status,
                client: c.client
            })),
            ...contents.map(c => ({
                id: c.id,
                title: c.title,
                date: c.publishDate!,
                type: 'CONTENT' as const,
                status: c.status,
                project: c.project
            })),
            ...milestones.map(m => ({
                id: m.id,
                title: m.title,
                date: m.date,
                type: 'MILESTONE' as const,
                project: m.project
            }))
        ];

        return { events, users };
    },
    ['calendar-events'],
    { revalidate: 60 }
);

export async function getCalendarEvents() {
    try {
        return await getCachedCalendarEvents();
    } catch (error) {
        console.error("Calendar Events Error:", error);
        return { events: [], users: [] };
    }
}

