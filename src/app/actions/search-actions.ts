"use server";

import { db } from "@/lib/db";

export type SearchResult = {
    id: string;
    type: 'CLIENT' | 'PROJECT' | 'TASK' | 'USER';
    title: string;
    subtitle?: string;
    href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const searchTerm = query.trim().toLowerCase();

    try {
        // Search in parallel
        const [clients, projects, tasks, users] = await Promise.all([
            // Clients
            db.client.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { email: { contains: searchTerm, mode: 'insensitive' } },
                        { company: { contains: searchTerm, mode: 'insensitive' } },
                    ]
                },
                take: 5,
                select: { id: true, name: true, email: true, industry: true }
            }),
            // Projects
            db.project.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } },
                    ]
                },
                take: 5,
                include: { client: { select: { name: true } } }
            }),
            // Tasks
            db.task.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } },
                    ]
                },
                take: 5,
                include: { project: { select: { name: true } } }
            }),
            // Users
            db.user.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { email: { contains: searchTerm, mode: 'insensitive' } },
                    ]
                },
                take: 3,
                select: { id: true, name: true, email: true, role: true }
            }),
        ]);

        const results: SearchResult[] = [
            ...clients.map(c => ({
                id: c.id,
                type: 'CLIENT' as const,
                title: c.name,
                subtitle: c.industry || c.email || undefined,
                href: `/clients/${c.id}`
            })),
            ...projects.map(p => ({
                id: p.id,
                type: 'PROJECT' as const,
                title: p.name,
                subtitle: p.client?.name,
                href: `/projects/${p.id}`
            })),
            ...tasks.map(t => ({
                id: t.id,
                type: 'TASK' as const,
                title: t.title,
                subtitle: t.project?.name,
                href: `/tasks/${t.id}`
            })),
            ...users.map(u => ({
                id: u.id,
                type: 'USER' as const,
                title: u.name,
                subtitle: u.role,
                href: `/settings`
            })),
        ];

        return results;
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}
