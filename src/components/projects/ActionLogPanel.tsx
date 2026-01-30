"use client";

import { useActionState } from "react";
import { addActionLog } from "@/app/projects/log-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Clock, FileText, CheckSquare, Users, Mail, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ActionLog {
    id: string;
    content: string;
    type: string;
    createdAt: Date;
    user?: { name: string } | null;
}

interface ActionLogPanelProps {
    projectId: string;
    logs: ActionLog[];
}

const initialState = {
    message: "",
    errors: {},
    success: false
};

const typeIcons: Record<string, any> = {
    NOTE: FileText,
    TASK: CheckSquare,
    MEETING: Users,
    EMAIL: Mail,
    WARNING: AlertTriangle,
};

const typeLabels: Record<string, string> = {
    NOTE: "Nota",
    TASK: "Tarea",
    MEETING: "Reunión",
    EMAIL: "Correo",
    WARNING: "Advertencia",
};

export function ActionLogPanel({ projectId, logs }: ActionLogPanelProps) {
    const [state, formAction] = useActionState(addActionLog, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [selectedType, setSelectedType] = useState("NOTE");

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [logs]);

    useEffect(() => {
        if (state?.success && formRef.current) {
            formRef.current.reset();
            setSelectedType("NOTE");
        }
    }, [state]);

    return (
        <div className="flex flex-col h-[600px] border-l border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="p-4 border-b border-border/50 bg-card/50">
                <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Registro de Acciones
                </h3>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {logs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No hay registros. Comienza a escribir para guardar acciones.
                        </p>
                    ) : (
                        logs.map((log) => {
                            const Icon = typeIcons[log.type] || FileText;
                            return (
                                <div key={log.id} className="flex flex-col gap-1">
                                    <div className="bg-accent/50 p-3 rounded-lg rounded-tl-none border border-border/30 text-sm">
                                        <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground uppercase font-semibold">
                                            <Icon className="h-3 w-3" />
                                            {typeLabels[log.type] || log.type}
                                        </div>
                                        {log.content}
                                    </div>
                                    <div className="flex items-center justify-between ml-1">
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                                        </span>
                                        <span className="text-[10px] font-medium text-primary/80">
                                            {log.user?.name || "Admin"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/50 bg-card/50 space-y-2">
                <form action={formAction} ref={formRef} className="flex flex-col gap-2">
                    <input type="hidden" name="projectId" value={projectId} />

                    <Select name="type" value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-full text-xs h-8">
                            <SelectValue placeholder="Tipo de acción" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NOTE">Nota</SelectItem>
                            <SelectItem value="TASK">Tarea</SelectItem>
                            <SelectItem value="MEETING">Reunión</SelectItem>
                            <SelectItem value="EMAIL">Correo</SelectItem>
                            <SelectItem value="WARNING">Advertencia</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Input
                            name="content"
                            placeholder="Registrar acción..."
                            required
                            autoComplete="off"
                            className="bg-background/50 border-border/50 focus-visible:ring-primary/20"
                        />
                        <Button type="submit" size="icon" className="shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
