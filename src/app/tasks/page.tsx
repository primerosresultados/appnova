
export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { getUserSession } from "@/app/actions/auth-actions";
import { ClientTaskList } from "@/components/tasks/ClientTaskList";
import { unstable_cache } from "next/cache";

// Cache tasks for 30 seconds to reduce DB load
const getCachedTasks = unstable_cache(
    async (userId: string | null, isAdmin: boolean) => {
        if (isAdmin) {
            return db.task.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            client: { select: { id: true, name: true } }
                        }
                    },
                    assignee: { select: { id: true, name: true, avatar: true, role: true } }
                },
                take: 100
            });
        } else {
            return db.task.findMany({
                where: { assigneeId: userId! },
                orderBy: { createdAt: 'desc' },
                take: 100,
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            client: { select: { id: true, name: true } }
                        }
                    },
                    assignee: { select: { id: true, name: true, avatar: true, role: true } }
                }
            });
        }
    },
    ['tasks-list'],
    { revalidate: 30 }
);

// Cache users list for 5 minutes
const getCachedUsers = unstable_cache(
    async () => {
        return db.user.findMany({
            select: { id: true, name: true, role: true },
            orderBy: { name: 'asc' }
        });
    },
    ['users-list'],
    { revalidate: 300 }
);

export default async function TasksPage() {
    let tasks: any[] = [];
    let dbError = null;
    let currentUser = null;
    let users: any[] = [];

    try {
        currentUser = await getUserSession();

        if (!currentUser) {
            return <div className="p-8">Acceso denegado. Por favor inicia sesión.</div>;
        }

        const isAdminOrKAM = (currentUser.role as string) === 'SUPERADMIN' || (currentUser.role as string) === 'ADMIN' || (currentUser.role as string) === 'KAM';

        // Use cached queries
        if (isAdminOrKAM) {
            [tasks, users] = await Promise.all([
                getCachedTasks(null, true),
                getCachedUsers()
            ]);
        } else {
            tasks = await getCachedTasks(currentUser.id, false);
            users = [];
        }

    } catch (error: any) {
        console.error("Error fetching tasks:", error);
        dbError = error.message;
    }

    return (
        <div className="space-y-4 md:space-y-8 animate-in fade-in-50 duration-500 pb-10">

            {/* Error Alert */}
            {dbError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-4 text-sm">
                    <strong>Error de Conexión:</strong> {dbError}
                    <br />
                    Verifica la variable <code>DATABASE_URL</code> en Vercel.
                </div>
            )}

            {/* Client Side Task List with Filtering */}
            <ClientTaskList
                initialTasks={tasks}
                users={users}
                userRole={currentUser?.role || 'STANDARD'}
            />
        </div>
    );
}

