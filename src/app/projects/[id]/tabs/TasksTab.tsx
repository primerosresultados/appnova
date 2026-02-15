
import { db } from "@/lib/db";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ListTodo, User } from "lucide-react";
import { format } from "date-fns";
import { TaskStatusSelect } from "@/components/tasks/TaskStatusSelect";
import { getProjectTasks } from "@/app/projects/actions-fetchers";
import { TaskItem } from "@/components/projects/TaskItem";
import { NewTaskSheet } from "@/components/projects/NewTaskSheet";
import { CompletedTasksCollapsible } from "@/components/projects/CompletedTasksCollapsible";

export default async function TasksTab({ projectId, isClient }: { projectId: string, isClient: boolean }) {
    // 1. Fetch data directly here
    const tasks = await getProjectTasks(projectId);

    const priorityMap: Record<string, { label: string; color: string }> = {
        LOW: { label: "Baja", color: "text-slate-500 bg-slate-500/10" },
        MEDIUM: { label: "Media", color: "text-amber-500 bg-amber-500/10" },
        HIGH: { label: "Alta", color: "text-red-500 bg-red-500/10" },
    };

    const pendingTasks = tasks.filter((t: any) => t.status !== "DONE");
    const completedTasks = tasks.filter((t: any) => t.status === "DONE");

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed rounded-lg bg-card">
                <ListTodo className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No hay tareas pendientes</h3>
                <p className="text-muted-foreground mb-4">Todas las tareas están al día.</p>
                {!isClient && <NewTaskSheet projectId={projectId} />}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {!isClient && (
                <div className="flex justify-end">
                    <NewTaskSheet projectId={projectId} />
                </div>
            )}
            {/* Pending tasks */}
            <div className="grid gap-2">
                {pendingTasks.map((task: any) => (
                    <TaskItem key={task.id} task={task} priorityMap={priorityMap} />
                ))}
            </div>

            {/* Completed tasks collapsible */}
            {completedTasks.length > 0 && (
                <CompletedTasksCollapsible count={completedTasks.length}>
                    {completedTasks.map((task: any) => (
                        <TaskItem key={task.id} task={task} priorityMap={priorityMap} />
                    ))}
                </CompletedTasksCollapsible>
            )}
        </div>
    );
}
