
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, Circle, ListTodo, Workflow, FileText, LayoutDashboard, Database, User, Link as LinkIcon, Paperclip, Send } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ActionLogPanel } from "@/components/projects/ActionLogPanel";
import { TaskDetailView } from "@/components/tasks/TaskDetailView";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

async function getTask(id: string) {
    const task = await db.task.findUnique({
        where: { id },
        include: {
            project: {
                include: { client: true }
            },
            assignee: true,
            actionLogs: {
                include: { user: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    return task;
}

export default async function TaskDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const task = await getTask(id);

    if (!task) {
        notFound();
    }

    return <TaskDetailView task={task} />;
}
