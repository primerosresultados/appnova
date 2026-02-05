import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

async function getRecentActivity() {
    try {
        const logs = await db.actionLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                type: true,
                createdAt: true,
                user: {
                    select: { name: true }
                },
                project: {
                    select: { name: true }
                }
            }
        });
        return logs;
    } catch (error) {
        return [];
    }
}

function getActionText(type: string) {
    switch (type) {
        case 'NOTE': return 'dejó una nota en';
        case 'TASK': return 'creó una tarea en';
        case 'MEETING': return 'agendó reunión en';
        case 'EMAIL': return 'envió correo en';
        case 'WARNING': return 'reportó problema en';
        case 'MILESTONE': return 'creó un hito en';
        default: return 'actualizó';
    }
}

function getActionColor(type: string) {
    switch (type) {
        case 'NOTE': return 'bg-blue-500/20 text-blue-500';
        case 'TASK': return 'bg-emerald-500/20 text-emerald-500';
        case 'WARNING': return 'bg-red-500/20 text-red-500';
        case 'MILESTONE': return 'bg-purple-500/20 text-purple-500';
        default: return 'bg-gray-500/20 text-gray-500';
    }
}

export async function ActivityWidget() {
    const recentActivity = await getRecentActivity();

    return (
        <Card className="bg-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="space-y-3 md:space-y-4">
                    {recentActivity.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No hay actividad reciente.</p>
                    ) : (
                        recentActivity.slice(0, 3).map((log: any) => (
                            <div key={log.id} className="flex items-center gap-3 md:gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                <Avatar className={`h-8 w-8 md:h-9 md:w-9 border-0 ${getActionColor(log.type)}`}>
                                    <AvatarFallback className="bg-transparent font-bold text-xs md:text-sm">
                                        {log.user?.name ? log.user.name.substring(0, 2).toUpperCase() : 'Sys'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        <span className="text-foreground">{log.user?.name || 'Sistema'}</span> <span className="text-muted-foreground font-normal">{getActionText(log.type)}</span> <span className="text-foreground font-medium">{log.project?.name || 'un proyecto'}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: es })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
