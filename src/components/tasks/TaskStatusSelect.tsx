"use client";

import { useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTaskStatus } from "@/app/tasks/actions";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { usePathname } from "next/navigation";

interface TaskStatusSelectProps {
    taskId: string;
    status: string;
    variant?: "default" | "minimal";
}

const statusOptions = [
    { value: "TODO", label: "Pendiente", icon: Circle, color: "text-slate-500", bg: "bg-slate-500/10" },
    { value: "IN_PROGRESS", label: "En Progreso", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { value: "REVIEW", label: "Revisión", icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10" },
    { value: "DONE", label: "Completado", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export function TaskStatusSelect({ taskId, status, variant = "default" }: TaskStatusSelectProps) {
    const [currentStatus, setCurrentStatus] = useState(status);
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const handleStatusChange = (value: string) => {
        const previousStatus = currentStatus;
        setCurrentStatus(value); // Optimistic update

        startTransition(async () => {
            const result = await updateTaskStatus(taskId, value, pathname);
            if (!result.success) {
                toast.error("Error al actualizar estado");
                setCurrentStatus(previousStatus); // Revert on failure
            } else {
                toast.success("Estado actualizado");
            }
        });
    };

    const currentOption = statusOptions.find(o => o.value === currentStatus) || statusOptions[0];
    const Icon = currentOption.icon;

    if (variant === "minimal") {
        return (
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
                    <SelectTrigger className="h-8 w-auto px-2 border-0 shadow-none focus:ring-0 bg-transparent p-0 group/status hover:opacity-80 transition-opacity">
                        <Badge variant="outline" className={`${currentOption.bg} ${currentOption.color} border-0 px-2 py-0.5 flex items-center gap-1.5`}>
                            {isPending ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
                            {currentOption.label}
                            <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
                        </Badge>
                    </SelectTrigger>
                    <SelectContent align="start">
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                    <option.icon className={`h-3 w-3 ${option.color}`} />
                                    <span>{option.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return (
        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
                <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Icon className={`h-4 w-4 ${currentOption.color}`} />}
                        <SelectValue>{currentOption.label}</SelectValue>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                                <option.icon className={`h-4 w-4 ${option.color}`} />
                                <span>{option.label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
