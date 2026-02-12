"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, User } from "lucide-react";
import { format } from "date-fns";
import { TaskStatusSelect } from "@/components/tasks/TaskStatusSelect";

function TaskDescriptionBox({ description }: { description: string | null }) {
    const [expanded, setExpanded] = useState(false);

    if (!description) return null;
    const cleanText = description.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) return null;

    const isLong = cleanText.length > 100;

    return (
        <div className="ml-11 mt-2 p-3 bg-accent/20 rounded-md text-sm border border-border/30">
            <p className={`text-muted-foreground text-xs ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
                {cleanText}
            </p>
            {isLong && (
                <button
                    onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
                    className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                >
                    {expanded ? (
                        <>Ver menos <ChevronUp className="h-3 w-3" /></>
                    ) : (
                        <>Ver más <ChevronDown className="h-3 w-3" /></>
                    )}
                </button>
            )}
        </div>
    );
}

export function TaskItem({ task, priorityMap }: { task: any, priorityMap: any }) {
    return (
        <Link href={`/tasks/${task.id}`}>
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-border/20 bg-card hover:bg-card hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-0 relative z-10">
                    <div className="flex items-start gap-3 w-full">
                        <div className={`p-2 rounded-full mt-0.5 shrink-0 ${task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors'}`}>
                            {task.status === 'DONE' ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className={`font-medium leading-snug ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-primary transition-colors'}`}>{task.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                {task.assignee ? (
                                    <div className="flex items-center gap-1">
                                        <Avatar className="h-4 w-4">
                                            <AvatarFallback className="text-[9px]">{task.assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span>{task.assignee.name}</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> Sin asignar</span>
                                )}
                                <span>•</span>
                                <span>Vence: {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'Sin fecha'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-11 md:ml-0 self-start">
                        <Badge variant="outline" className={priorityMap[task.priority]?.color}>
                            {priorityMap[task.priority]?.label}
                        </Badge>
                        <TaskStatusSelect taskId={task.id} status={task.status} variant="minimal" />
                    </div>
                </div>

                {(task.description || task.links) && (
                    <TaskDescriptionBox description={task.description} />
                )}
            </div>
        </Link>
    );
}
