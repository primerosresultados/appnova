"use client";

import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, CalendarDays, TrendingUp, Hash, Calendar as CalendarIcon, X, Tag, DollarSign } from "lucide-react";
import { createConversion, deleteConversion } from "@/app/projects/conversion-actions";
import { toast } from "react-hot-toast";

type FilterMode = "all" | "week" | "month" | "custom";

interface Conversion {
    id: string;
    quantity: number;
    amount: number | null;
    description: string | null;
    tags: string | null;
    channel: string | null;
    date: string | Date;
    createdAt: string | Date;
    createdBy: { id: string; name: string | null; avatar: string | null } | null;
}

interface ConversionsTabClientProps {
    projectId: string;
    conversions: Conversion[];
}

const CHANNEL_OPTIONS = [
    { value: "", label: "Sin canal" },
    { value: "Google Ads", label: "Google Ads" },
    { value: "Meta Ads", label: "Meta Ads" },
    { value: "Orgánico", label: "Orgánico" },
    { value: "Referido", label: "Referido" },
    { value: "Directo", label: "Directo" },
    { value: "Email", label: "Email" },
    { value: "Otro", label: "Otro" },
];

const channelColors: Record<string, string> = {
    "Google Ads": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Meta Ads": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    "Orgánico": "bg-green-500/10 text-green-600 border-green-500/20",
    "Referido": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Directo": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    "Email": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Otro": "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

function parseTags(tagsStr: string | null): string[] {
    if (!tagsStr) return [];
    try { return JSON.parse(tagsStr); } catch { return []; }
}

export function ConversionsTabClient({ projectId, conversions }: ConversionsTabClientProps) {
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [customChannel, setCustomChannel] = useState("");
    const [selectedChannel, setSelectedChannel] = useState("");

    const now = new Date();

    const filteredConversions = useMemo(() => {
        if (filterMode === "all") return conversions;

        let start: Date;
        let end: Date;

        if (filterMode === "week") {
            start = startOfWeek(now, { weekStartsOn: 1 });
            end = endOfWeek(now, { weekStartsOn: 1 });
        } else if (filterMode === "month") {
            start = startOfMonth(now);
            end = endOfMonth(now);
        } else {
            if (!customFrom || !customTo) return conversions;
            start = new Date(customFrom);
            end = new Date(customTo);
            end.setHours(23, 59, 59, 999);
        }

        return conversions.filter((c) => {
            const d = new Date(c.date);
            return isWithinInterval(d, { start, end });
        });
    }, [conversions, filterMode, customFrom, customTo]);

    const totalQuantity = useMemo(
        () => filteredConversions.reduce((sum, c) => sum + c.quantity, 0),
        [filteredConversions]
    );

    const totalAmount = useMemo(
        () => filteredConversions.reduce((sum, c) => sum + (c.amount || 0), 0),
        [filteredConversions]
    );

    const addTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t)) {
            setTags([...tags, t]);
        }
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        // Set tags as JSON
        formData.set("tags", tags.length > 0 ? JSON.stringify(tags) : "");
        // Set channel — use custom if "Otro"
        const ch = selectedChannel === "Otro" ? customChannel.trim() : selectedChannel;
        formData.set("channel", ch);
        const result = await createConversion(projectId, formData);
        if (result.success) {
            toast.success(result.message);
            setIsAdding(false);
            setTags([]);
            setTagInput("");
            setSelectedChannel("");
            setCustomChannel("");
        } else {
            toast.error(result.message);
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        const result = await deleteConversion(id, projectId);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const filterLabel = {
        all: "Todo",
        week: "Esta semana",
        month: "Este mes",
        custom: "Rango personalizado",
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Total conversiones</p>
                            <p className="text-2xl font-bold text-emerald-500">{totalQuantity}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Monto total</p>
                            <p className="text-2xl font-bold text-amber-500">${totalAmount.toLocaleString("es-CL")}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Hash className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Registros</p>
                            <p className="text-2xl font-bold">{filteredConversions.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <CalendarDays className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Período</p>
                            <p className="text-sm font-semibold">{filterLabel[filterMode]}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters + Add Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    {(["all", "week", "month", "custom"] as FilterMode[]).map((mode) => (
                        <Button
                            key={mode}
                            size="sm"
                            variant={filterMode === mode ? "default" : "outline"}
                            onClick={() => setFilterMode(mode)}
                            className="text-xs"
                        >
                            {filterLabel[mode]}
                        </Button>
                    ))}
                </div>
                <Button size="sm" onClick={() => setIsAdding(!isAdding)} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Agregar Conversión
                </Button>
            </div>

            {/* Custom Range Inputs */}
            {filterMode === "custom" && (
                <div className="flex items-end gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                    <div className="grid gap-1.5">
                        <Label className="text-xs">Desde</Label>
                        <Input
                            type="date"
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label className="text-xs">Hasta</Label>
                        <Input
                            type="date"
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                            className="h-8 text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Add Form */}
            {isAdding && (
                <form onSubmit={handleCreate} className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
                    <p className="text-sm font-semibold">Nueva Conversión</p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Cantidad *</Label>
                            <Input name="quantity" type="number" min="1" defaultValue="1" required className="h-9" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Monto (opcional)</Label>
                            <Input name="amount" type="number" step="any" min="0" placeholder="$0" className="h-9" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Fecha *</Label>
                            <Input name="date" type="date" required defaultValue={format(now, "yyyy-MM-dd")} className="h-9" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Descripción</Label>
                            <Input name="description" placeholder="Ej: Venta web, Lead..." className="h-9" />
                        </div>
                    </div>

                    {/* Channel & Tags row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Canal</Label>
                            <select
                                value={selectedChannel}
                                onChange={(e) => setSelectedChannel(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {CHANNEL_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {selectedChannel === "Otro" && (
                                <Input
                                    value={customChannel}
                                    onChange={(e) => setCustomChannel(e.target.value)}
                                    placeholder="Nombre del canal..."
                                    className="h-9 mt-1"
                                />
                            )}
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Etiquetas</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") { e.preventDefault(); addTag(); }
                                    }}
                                    placeholder="Agregar etiqueta y Enter..."
                                    className="h-9 flex-1"
                                />
                                <Button type="button" variant="outline" size="sm" className="h-9 px-3" onClick={addTag}>
                                    <Tag className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { setIsAdding(false); setTags([]); setSelectedChannel(""); }}>
                            Cancelar
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Registrar"}
                        </Button>
                    </div>
                </form>
            )}

            {/* Conversions List */}
            {filteredConversions.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border/50 rounded-lg">
                    <TrendingUp className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="text-base font-medium">Sin conversiones</h3>
                    <p className="text-sm text-muted-foreground">
                        {filterMode !== "all"
                            ? "No hay conversiones en el período seleccionado."
                            : "Agrega tu primera conversión para comenzar a trackear."}
                    </p>
                </div>
            ) : (
                <div className="border border-border/50 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="hidden sm:grid grid-cols-[1fr_60px_90px_1fr_90px_auto_90px_40px] gap-3 px-4 py-2.5 bg-muted/40 border-b border-border/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <span>Fecha</span>
                        <span className="text-right">Cant.</span>
                        <span className="text-right">Monto</span>
                        <span>Descripción</span>
                        <span>Canal</span>
                        <span>Etiquetas</span>
                        <span>Registrado</span>
                        <span></span>
                    </div>
                    {/* Rows */}
                    {filteredConversions.map((conversion) => {
                        const convTags = parseTags(conversion.tags);
                        return (
                            <div
                                key={conversion.id}
                                className="grid grid-cols-1 sm:grid-cols-[1fr_60px_90px_1fr_90px_auto_90px_40px] gap-2 sm:gap-3 px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors items-center"
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground sm:hidden" />
                                    <span className="text-sm font-medium">
                                        {format(new Date(conversion.date), "d MMM yyyy", { locale: es })}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-emerald-500 sm:text-right tabular-nums">
                                    {conversion.quantity}
                                </span>
                                <span className="text-sm font-medium text-amber-500 sm:text-right tabular-nums">
                                    {conversion.amount != null ? `$${Number(conversion.amount).toLocaleString("es-CL")}` : "—"}
                                </span>
                                <span className="text-sm text-muted-foreground truncate">
                                    {conversion.description || "—"}
                                </span>
                                <span>
                                    {conversion.channel ? (
                                        <Badge variant="outline" className={`text-[10px] ${channelColors[conversion.channel] || channelColors["Otro"]}`}>
                                            {conversion.channel}
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                    {convTags.length > 0 ? convTags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                            {tag}
                                        </Badge>
                                    )) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground truncate">
                                    {conversion.createdBy?.name || "Sistema"}
                                </span>
                                <button
                                    onClick={() => handleDelete(conversion.id)}
                                    className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors justify-self-end"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
