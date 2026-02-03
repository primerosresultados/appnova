
export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { getUserSession } from "@/app/actions/auth-actions";
import { ClientTaskList } from "@/components/tasks/ClientTaskList";
import { CheckCircle2 } from "lucide-react";

export default async function TasksPage() {
    let tasks: any[] = [];
    let dbError = null;
    let currentUser = null;
    let users: any[] = [];

    try {
        currentUser = await getUserSession();

        if (!currentUser) {
            // Handle unauthenticated case appropriately (redirect or show error)
            return <div className="p-8">Acceso denegado. Por favor inicia sesión.</div>;
        }

        const isAdminOrKAM = (currentUser.role as string) === 'SUPERADMIN' || (currentUser.role as string) === 'ADMIN' || (currentUser.role as string) === 'KAM';

        if (isAdminOrKAM) {
            // Fetch ALL tasks and ALL users for filter
            [tasks, users] = await Promise.all([
                db.task.findMany({
                    orderBy: { createdAt: 'desc' },
                    include: {
                        project: {
                            include: { client: true }
                        },
                        assignee: true
                    },
                    take: 100 // Limit for performance
                }),
                db.user.findMany({
                    select: { id: true, name: true, role: true },
                    orderBy: { name: 'asc' }
                })
            ]);
        } else {
            // Fetch ONLY assigned tasks
            tasks = await db.task.findMany({
                where: { assigneeId: currentUser.id },
                orderBy: { createdAt: 'desc' },
                take: 100, // Limit for performance
                include: {
                    project: {
                        include: { client: true }
                    },
                    assignee: true
                }
            });
            // No need to fetch other users
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
