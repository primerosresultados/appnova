"use client";

import React, { useState, useCallback } from "react";
import { TaskItem } from "@/components/projects/TaskItem";
import { NewTaskSheet } from "@/components/projects/NewTaskSheet";
import { CompletedTasksCollapsible } from "@/components/projects/CompletedTasksCollapsible";
import { ListTodo } from "lucide-react";

interface User {
    id: string;
    name: string;
}

interface ClientTasksTabProps {
    initialTasks: any[];
    projectId: string;
    users: User[];
    isClient: boolean;
}

const priorityMap: Record<string, { label: string; color: string }> = {
    LOW: { label: "Baja", color: "text-slate-500 bg-slate-500/10" },
    MEDIUM: { label: "Media", color: "text-amber-500 bg-amber-500/10" },
    HIGH: { label: "Alta", color: "text-red-500 bg-red-500/10" },
};

export default function ClientTasksTab({ initialTasks, projectId, users, isClient }: ClientTasksTabProps) {
    const [tasks, setTasks] = useState<any[]>(initialTasks);

    const handleTaskCreated = useCallback((newTask: any) => {
        setTasks(prev => [newTask, ...prev]);
    }, []);

    const handleTaskDeleted = useCallback((taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);

    const pendingTasks = tasks.filter((t: any) => t.status !== "DONE");
    const completedTasks = tasks.filter((t: any) => t.status === "DONE");

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed rounded-lg bg-card">
                <ListTodo className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No hay tareas pendientes</h3>
                <p className="text-muted-foreground mb-4">Todas las tareas están al día.</p>
                {!isClient && <NewTaskSheet projectId={projectId} users={users} onTaskCreated={handleTaskCreated} />}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {!isClient && (
                <div className="flex justify-end">
                    <NewTaskSheet projectId={projectId} users={users} onTaskCreated={handleTaskCreated} />
                </div>
            )}
            {/* Pending tasks */}
            <div className="grid gap-2">
                {pendingTasks.map((task: any) => (
                    <TaskItem key={task.id} task={task} priorityMap={priorityMap} onDeleted={handleTaskDeleted} />
                ))}
            </div>

            {/* Completed tasks collapsible */}
            {completedTasks.length > 0 && (
                <CompletedTasksCollapsible count={completedTasks.length}>
                    {completedTasks.map((task: any) => (
                        <TaskItem key={task.id} task={task} priorityMap={priorityMap} onDeleted={handleTaskDeleted} />
                    ))}
                </CompletedTasksCollapsible>
            )}
        </div>
    );
}
