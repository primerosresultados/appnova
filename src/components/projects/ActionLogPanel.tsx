"use client";

import { useActionState, useOptimistic } from "react";
import { addActionLog } from "@/app/projects/log-actions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Clock, FileText, Eye, EyeOff, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useFormStatus } from "react-dom";

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

const typeConfig: Record<string, { label: string; color: string; bg: string; avatarGradient: string; bubbleBg: string }> = {
    NOTE: { label: "Nota", color: "text-sky-600", bg: "bg-sky-500/10 border-sky-500/30 text-sky-600", avatarGradient: "from-sky-400 to-blue-500", bubbleBg: "bg-sky-50/50 border-sky-200/40 dark:bg-sky-950/20 dark:border-sky-800/30" },
    TASK: { label: "Tarea", color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30 text-amber-600", avatarGradient: "from-amber-400 to-orange-500", bubbleBg: "bg-amber-50/50 border-amber-200/40 dark:bg-amber-950/20 dark:border-amber-800/30" },
    MEETING: { label: "Reunión", color: "text-violet-600", bg: "bg-violet-500/10 border-violet-500/30 text-violet-600", avatarGradient: "from-violet-400 to-purple-500", bubbleBg: "bg-violet-50/50 border-violet-200/40 dark:bg-violet-950/20 dark:border-violet-800/30" },
    EMAIL: { label: "Correo", color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600", avatarGradient: "from-emerald-400 to-teal-500", bubbleBg: "bg-emerald-50/50 border-emerald-200/40 dark:bg-emerald-950/20 dark:border-emerald-800/30" },
    WARNING: { label: "Advertencia", color: "text-red-600", bg: "bg-red-500/10 border-red-500/30 text-red-600", avatarGradient: "from-red-400 to-rose-500", bubbleBg: "bg-red-50/50 border-red-200/40 dark:bg-red-950/20 dark:border-red-800/30" },
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            size="icon"
            className="h-7 w-7"
            disabled={pending}
        >
            {pending ? <Clock className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        </Button>
    );
}

export function ActionLogPanel({ projectId, logs, currentUser }: ActionLogPanelProps) {
    const [state, formAction] = useActionState(addActionLog, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [selectedType, setSelectedType] = useState("NOTE");
    const [content, setContent] = useState("");

    const [isPublic, setIsPublic] = useState(false);

    const isClient = currentUser?.role === 'CLIENTE';

    const visibleLogs = logs.filter(log => {
        if (!isClient) return true;
        return log.isPublic || (currentUser && log.userId === currentUser.id);
    });

    const [optimisticLogs, addOptimisticLog] = useOptimistic(
        visibleLogs,
        (state, newLog: ActionLog) => [...state, newLog]
    );

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [optimisticLogs]);

    useEffect(() => {
        if (state?.success && formRef.current) {
            formRef.current.reset();
            setContent("");
            setSelectedType("NOTE");
            if (!isClient) setIsPublic(false);
        }
    }, [state, isClient]);

    async function handleAction(formData: FormData) {
        const contentVal = formData.get("content") as string;
        const type = formData.get("type") as string || "NOTE";
        const isPublicStr = formData.get("isPublic") as string;

        addOptimisticLog({
            id: 'optimistic-' + Date.now(),
            content: contentVal,
            type,
            createdAt: new Date(),
            user: currentUser ? { name: currentUser.name || "Yo", id: currentUser.id } : { name: "Usuario", id: "me" },
            userId: currentUser?.id,
            isPublic: isPublicStr === "true"
        });

        await formAction(formData);
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-card backdrop-blur-sm">
            {/* Header */}
            <div className="p-4 pb-3 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5">
                <h3 className="text-base font-bold flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-sm">
                        <FileText className="h-3.5 w-3.5 text-white" />
                    </div>
                    Bitácora {isClient ? "de Proyecto" : ""}
                </h3>
            </div>

            {/* Log entries */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-6">
                    {optimisticLogs.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-sm">
                            No hay registros en la bitácora.
                        </div>
                    ) : (
                        optimisticLogs.map((log) => {
                            const isOptimistic = log.id.startsWith('optimistic-');
                            const isOwnMessage = (currentUser && log.userId === currentUser.id) || isOptimistic;

                            return (
                                <div key={log.id} className={`flex gap-3 text-sm group ${isOptimistic ? 'opacity-60' : ''}`}>
                                    {/* Avatar */}
                                    <div className="mt-0.5 shrink-0">
                                        <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${typeConfig[log.type]?.avatarGradient || 'from-primary to-blue-500'} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                                            {log.user?.name?.substring(0, 1) || "S"}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold text-xs ${typeConfig[log.type]?.color || 'text-primary'}`}>{log.user?.name || "Sistema"}</span>
                                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 border ${typeConfig[log.type]?.bg || 'bg-muted text-muted-foreground'}`}>
                                                {typeConfig[log.type]?.label || log.type}
                                            </Badge>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block">
                                            {format(new Date(log.createdAt), 'dd MMM, HH:mm', { locale: es })}
                                            {isOptimistic && " (Enviando...)"}
                                        </span>
                                        <div className={`p-3 rounded-lg rounded-tl-none text-foreground/90 leading-relaxed border text-xs whitespace-pre-wrap ${typeConfig[log.type]?.bubbleBg || 'bg-muted/40 border-border/30'}`}>
                                            {log.content}
                                        </div>

                                        {/* Action buttons */}
                                        {!isOptimistic && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isClient && (
                                                    <button
                                                        type="button"
                                                        title={log.isPublic ? "Visible para cliente" : "Solo interno"}
                                                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                        onClick={async () => {
                                                            const message = log.isPublic
                                                                ? "¿Ocultar este comentario al cliente?"
                                                                : "¿Hacer visible para el cliente?";
                                                            if (confirm(message)) {
                                                                const { toggleLogVisibility } = await import("@/app/projects/log-actions");
                                                                try {
                                                                    const res = await toggleLogVisibility(log.id, projectId);
                                                                    if (res.success) toast.success(res.message);
                                                                    else toast.error(res.message);
                                                                } catch (e) {
                                                                    toast.error("Error al actualizar");
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {log.isPublic ? (
                                                            <><Eye className="h-3 w-3 text-emerald-500" /> Público</>
                                                        ) : (
                                                            <><EyeOff className="h-3 w-3" /> Privado</>
                                                        )}
                                                    </button>
                                                )}
                                                {(isOwnMessage || !isClient) && (
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm("¿Eliminar este registro?")) {
                                                                const { deleteActionLog } = await import("@/app/projects/log-actions");
                                                                try {
                                                                    const res = await deleteActionLog(log.id, projectId);
                                                                    if (res.success) toast.success("Eliminado");
                                                                    else toast.error(res.message);
                                                                } catch (err) {
                                                                    toast.error("Error al eliminar");
                                                                }
                                                            }
                                                        }}
                                                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-3 w-3" /> Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border/50 bg-background/30 mt-auto">
                <form action={handleAction} ref={formRef}>
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="isPublic" value={isClient ? "true" : isPublic.toString()} />
                    <input type="hidden" name="content" value={content} />

                    <Textarea
                        placeholder={isClient ? "Enviar mensaje a la agencia..." : "Registrar acción..."}
                        className="min-h-[80px] resize-none text-sm bg-background/50 focus:bg-background transition-colors mb-2"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (content.trim()) {
                                    formRef.current?.requestSubmit();
                                }
                            }
                        }}
                    />

                    <div className="flex items-center gap-2">
                        <Select name="type" value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-[130px] h-7 text-xs bg-background/50">
                                <SelectValue />
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
                                    className="h-3.5 w-3.5"
                                />
                                <Label htmlFor="public-mode" className="text-[10px] cursor-pointer select-none flex items-center gap-1 text-muted-foreground">
                                    {isPublic ? <Eye className="h-3 w-3 text-emerald-500" /> : <EyeOff className="h-3 w-3" />}
                                    {isPublic ? "Público" : "Privado"}
                                </Label>
                            </div>
                        )}

                        <div className="ml-auto">
                            <SubmitButton />
                        </div>
                    </div>
                </form>
                <p className="text-[10px] text-muted-foreground mt-2 text-right">Enter para enviar</p>
            </div>
        </div>
    );
}
