"use client";

import { useActionState } from "react";
import { addActionLog } from "@/app/projects/log-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Clock, FileText, CheckSquare, Users, Mail, AlertTriangle, Eye, EyeOff, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

interface ActionLog {
    id: string;
    content: string;
    type: string;
    createdAt: Date;
    user?: { name: string; id: string } | null;
    userId?: string | null;
    isPublic: boolean;
}

interface ActionLogPanelProps {
    projectId: string;
    logs: ActionLog[];
    currentUser?: any;
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

const typeColors: Record<string, string> = {
    NOTE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    TASK: "bg-green-500/20 text-green-400 border-green-500/30",
    MEETING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    EMAIL: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    WARNING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export function ActionLogPanel({ projectId, logs, currentUser }: ActionLogPanelProps) {
    const [state, formAction] = useActionState(addActionLog, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [selectedType, setSelectedType] = useState("NOTE");

    // Admin state for toggle
    const [isPublic, setIsPublic] = useState(false);

    const isClient = currentUser?.role === 'CLIENTE';

    // Filter logs based on visibility
    const visibleLogs = logs.filter(log => {
        if (!isClient) return true; // Admins see everything
        return log.isPublic || (currentUser && log.userId === currentUser.id);
    });

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [visibleLogs]); // Depend on visibleLogs instead of logs

    useEffect(() => {
        if (state?.success && formRef.current) {
            formRef.current.reset();
            setSelectedType("NOTE");
            if (!isClient) setIsPublic(false); // Reset to private for admins
        }
    }, [state, isClient]);

    return (
        <div className="flex flex-col h-full bg-card backdrop-blur-sm">
            <div className="p-4 border-b border-border/50 bg-card">
                <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Bitácora {isClient ? "de Proyecto" : ""}
                </h3>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {visibleLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No hay registros visibles.
                        </p>
                    ) : (
                        visibleLogs.map((log) => {
                            const Icon = typeIcons[log.type] || FileText;
                            const colorClass = typeColors[log.type] || "bg-accent/50 text-muted-foreground border-border/30";
                            const isOwnMessage = currentUser && log.userId === currentUser.id;

                            return (
                                <div key={log.id} className="flex flex-col gap-1 relative group">
                                    <div className={`p-3 rounded-lg border text-sm ${colorClass} ${isOwnMessage ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-1 text-xs uppercase font-semibold">
                                                    <Icon className="h-3 w-3" />
                                                    {log.user?.name || "Usuario"}
                                                </span>
                                                <span className="text-[10px] opacity-70 uppercase">
                                                    {typeLabels[log.type] || log.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!isClient && (
                                                    <button
                                                        type="button"
                                                        title={log.isPublic ? "Visible para cliente (Click para ocultar)" : "Privado (Click para hacer público)"}
                                                        className="hover:bg-accent p-0.5 rounded transition-colors cursor-pointer"
                                                        onClick={async () => {
                                                            const message = log.isPublic
                                                                ? "¿Estás seguro de que deseas OCULTAR este comentario al cliente?"
                                                                : "¿Estás seguro de que deseas que el cliente VEA este comentario?";

                                                            if (confirm(message)) {
                                                                const { toggleLogVisibility } = await import("@/app/projects/log-actions");
                                                                try {
                                                                    const res = await toggleLogVisibility(log.id, projectId);
                                                                    if (res.success) {
                                                                        toast.success(res.message);
                                                                    } else {
                                                                        toast.error(res.message);
                                                                    }
                                                                } catch (e) {
                                                                    toast.error("Error al actualizar");
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {log.isPublic ? (
                                                            <Eye className="h-3 w-3 text-emerald-500" />
                                                        ) : (
                                                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                )}
                                                {(isOwnMessage || !isClient) && (
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm("¿Estás seguro de eliminar este registro?")) {
                                                                const { deleteActionLog } = await import("@/app/projects/log-actions");
                                                                // Optimistic update or just wait for revalidate
                                                                // For now, simpler to just convert to client component fully or use action directly
                                                                try {
                                                                    const res = await deleteActionLog(log.id, projectId);
                                                                    if (res.success) {
                                                                        toast.success("Registro eliminado");
                                                                    } else {
                                                                        toast.error(res.message);
                                                                    }
                                                                } catch (err) {
                                                                    toast.error("Error al eliminar");
                                                                }
                                                            }
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-black/10 rounded cursor-pointer text-muted-foreground hover:text-destructive"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-foreground whitespace-pre-wrap">{log.content}</p>
                                    </div>
                                    <div className={`flex items-center ${isOwnMessage ? 'justify-end mr-1' : 'ml-1'}`}>
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(log.createdAt), 'd MMM, HH:mm')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/50 bg-card space-y-2">
                <form action={formAction} ref={formRef} className="flex flex-col gap-2">
                    <input type="hidden" name="projectId" value={projectId} />

                    {/* For clients, always public. For admins, controlled by state */}
                    <input type="hidden" name="isPublic" value={isClient ? "true" : isPublic.toString()} />

                    <div className="flex items-center justify-between gap-2">
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

                        {!isClient && (
                            <div className="flex items-center space-x-2 shrink-0">
                                <Checkbox
                                    id="public-mode"
                                    checked={isPublic}
                                    onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                                />
                                <Label htmlFor="public-mode" className="text-xs cursor-pointer select-none flex items-center gap-1">
                                    {isPublic ? <Eye className="h-3 w-3 text-emerald-500" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                                    {isPublic ? "Público" : "Privado"}
                                </Label>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Input
                            name="content"
                            placeholder={isClient ? "Enviar mensaje a la agencia..." : "Registrar acción..."}
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
