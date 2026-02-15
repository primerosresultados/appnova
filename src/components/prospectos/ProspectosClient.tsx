"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus, Search, Phone, Mail, Building2, Globe, MessageSquare,
    Trash2, ChevronRight, UserPlus, DollarSign, MoreHorizontal,
    ArrowRight, X, FileText, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import {
    createProspect, updateProspectStatus, deleteProspect,
    addQuoteItem, deleteQuoteItem, convertToClient
} from "@/app/prospectos/actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    NUEVO: { label: "Nuevo", color: "text-blue-600", bg: "bg-blue-50 text-blue-700 border-blue-200" },
    CONTACTADO: { label: "Contactado", color: "text-amber-600", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    COTIZADO: { label: "Cotizado", color: "text-purple-600", bg: "bg-purple-50 text-purple-700 border-purple-200" },
    GANADO: { label: "Ganado", color: "text-emerald-600", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    PERDIDO: { label: "Perdido", color: "text-red-600", bg: "bg-red-50 text-red-700 border-red-200" },
};

const sourceOptions = [
    "Referido", "Website", "Instagram", "Facebook", "LinkedIn", "Google", "Llamada", "Email", "Otro"
];

interface ProspectosClientProps {
    initialProspects: any[];
}

export function ProspectosClient({ initialProspects }: ProspectosClientProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [selectedProspect, setSelectedProspect] = useState<any | null>(null);
    const [showQuoteDialog, setShowQuoteDialog] = useState(false);
    const [quoteProspectId, setQuoteProspectId] = useState<string>("");

    // Create prospect form
    const [createState, createAction] = useActionState(createProspect, { message: "", success: false });
    // Add quote item form
    const [quoteState, quoteAction] = useActionState(addQuoteItem, { message: "", success: false });

    useEffect(() => {
        if (createState?.success) {
            setShowNewDialog(false);
            toast.success("Prospecto creado");
            router.refresh();
        }
    }, [createState]);

    useEffect(() => {
        if (quoteState?.success) {
            setShowQuoteDialog(false);
            toast.success("Item agregado a la cotización");
            router.refresh();
        }
    }, [quoteState]);

    const filteredProspects = initialProspects.filter((p) => {
        const matchesSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.company?.toLowerCase().includes(search.toLowerCase()) ||
            p.email?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const total = initialProspects.length;
    const byStatus = Object.keys(statusConfig).reduce((acc, key) => {
        acc[key] = initialProspects.filter(p => p.status === key).length;
        return acc;
    }, {} as Record<string, number>);
    const totalQuoteValue = initialProspects.reduce((sum: number, p: any) =>
        sum + (p.quoteItems || []).reduce((s: number, q: any) => s + (q.unitPrice * q.quantity), 0), 0
    );

    const handleStatusChange = async (id: string, newStatus: string) => {
        const result = await updateProspectStatus(id, newStatus);
        if (result.success) {
            toast.success("Estado actualizado");
            router.refresh();
        }
    };

    const handleDelete = async (id: string) => {
        const result = await deleteProspect(id);
        if (result.success) {
            toast.success("Prospecto eliminado");
            if (selectedProspect?.id === id) setSelectedProspect(null);
            router.refresh();
        } else {
            toast.error("Error al eliminar");
        }
    };

    const handleDeleteQuoteItem = async (itemId: string) => {
        const result = await deleteQuoteItem(itemId);
        if (result.success) {
            toast.success("Item eliminado");
            router.refresh();
        }
    };

    const handleConvert = async (id: string) => {
        const result = await convertToClient(id);
        if (result.success) {
            toast.success("¡Cliente creado exitosamente!");
            router.refresh();
        } else {
            toast.error(result.message || "Error al convertir");
        }
    };

    const getQuoteTotal = (prospect: any) => {
        return (prospect.quoteItems || []).reduce(
            (sum: number, item: any) => sum + item.unitPrice * item.quantity, 0
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Prospectos</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona tus prospectos y genera cotizaciones rápidamente
                    </p>
                </div>
                <Button onClick={() => setShowNewDialog(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Prospecto
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <Card className="border-border/50">
                    <CardContent className="p-3">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-bold">{total}</p>
                    </CardContent>
                </Card>
                {Object.entries(statusConfig).slice(0, 3).map(([key, cfg]) => (
                    <Card key={key} className="border-border/50 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}>
                        <CardContent className="p-3">
                            <p className={cn("text-[10px] font-semibold uppercase tracking-wider", cfg.color)}>{cfg.label}</p>
                            <p className="text-2xl font-bold">{byStatus[key] || 0}</p>
                        </CardContent>
                    </Card>
                ))}
                <Card className="border-border/50 col-span-2 md:col-span-1 lg:col-span-2">
                    <CardContent className="p-3">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Cotizado</p>
                        <p className="text-2xl font-bold text-emerald-600">${totalQuoteValue.toLocaleString("es-CL")}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar prospectos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] h-9">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Prospects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProspects.map((prospect) => {
                    const cfg = statusConfig[prospect.status] || statusConfig.NUEVO;
                    const quoteTotal = getQuoteTotal(prospect);
                    const hasQuote = (prospect.quoteItems || []).length > 0;

                    return (
                        <Card
                            key={prospect.id}
                            className="group border-border/50 hover:shadow-lg hover:border-border transition-all cursor-pointer relative overflow-hidden"
                            onClick={() => setSelectedProspect(prospect)}
                        >
                            {/* Top accent */}
                            <div className={cn("h-1 w-full", {
                                "bg-blue-500": prospect.status === "NUEVO",
                                "bg-amber-500": prospect.status === "CONTACTADO",
                                "bg-purple-500": prospect.status === "COTIZADO",
                                "bg-emerald-500": prospect.status === "GANADO",
                                "bg-red-400": prospect.status === "PERDIDO",
                            })} />
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-base truncate">{prospect.name}</h3>
                                        {prospect.company && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Building2 className="h-3 w-3" />
                                                {prospect.company}
                                            </p>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuItem onClick={() => {
                                                setQuoteProspectId(prospect.id);
                                                setShowQuoteDialog(true);
                                            }}>
                                                <DollarSign className="h-4 w-4 mr-2" />
                                                Agregar Item Cotización
                                            </DropdownMenuItem>
                                            {Object.entries(statusConfig).map(([key, s]) => (
                                                key !== prospect.status && (
                                                    <DropdownMenuItem key={key} onClick={() => handleStatusChange(prospect.id, key)}>
                                                        <ArrowRight className="h-4 w-4 mr-2" />
                                                        Mover a {s.label}
                                                    </DropdownMenuItem>
                                                )
                                            ))}
                                            <DropdownMenuSeparator />
                                            {prospect.status === "COTIZADO" && (
                                                <DropdownMenuItem onClick={() => handleConvert(prospect.id)}
                                                    className="text-emerald-600 focus:text-emerald-600">
                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                    Convertir a Cliente
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(prospect.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Contact info */}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {prospect.email && (
                                        <span className="flex items-center gap-1 truncate">
                                            <Mail className="h-3 w-3 shrink-0" />
                                            {prospect.email}
                                        </span>
                                    )}
                                    {prospect.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-3 w-3 shrink-0" />
                                            {prospect.phone}
                                        </span>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                                    <Badge variant="outline" className={cn("text-[10px] h-5 border", cfg.bg)}>
                                        {cfg.label}
                                    </Badge>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        {hasQuote && (
                                            <span className="font-semibold text-foreground">
                                                ${quoteTotal.toLocaleString("es-CL")}
                                            </span>
                                        )}
                                        {prospect.source && (
                                            <span className="flex items-center gap-1">
                                                <Globe className="h-3 w-3" />
                                                {prospect.source}
                                            </span>
                                        )}
                                        <span>{format(new Date(prospect.createdAt), "d MMM", { locale: es })}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {filteredProspects.length === 0 && (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No hay prospectos</p>
                        <p className="text-sm mt-1">Crea tu primer prospecto para empezar a gestionar leads</p>
                    </div>
                )}
            </div>

            {/* Prospect Detail Side Panel */}
            <Dialog open={!!selectedProspect} onOpenChange={(open) => !open && setSelectedProspect(null)}>
                <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
                    {selectedProspect && (() => {
                        const cfg = statusConfig[selectedProspect.status] || statusConfig.NUEVO;
                        const quoteTotal = getQuoteTotal(selectedProspect);
                        return (
                            <>
                                <DialogHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <DialogTitle className="text-lg">{selectedProspect.name}</DialogTitle>
                                            {selectedProspect.company && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    {selectedProspect.company}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant="outline" className={cn("text-xs border", cfg.bg)}>
                                            {cfg.label}
                                        </Badge>
                                    </div>
                                </DialogHeader>

                                <div className="space-y-5 mt-2">
                                    {/* Contact */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedProspect.email && (
                                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <span className="truncate">{selectedProspect.email}</span>
                                            </div>
                                        )}
                                        {selectedProspect.phone && (
                                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <span>{selectedProspect.phone}</span>
                                            </div>
                                        )}
                                        {selectedProspect.source && (
                                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 text-sm">
                                                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <span>{selectedProspect.source}</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedProspect.notes && (
                                        <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/30">
                                            <MessageSquare className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                                            {selectedProspect.notes}
                                        </div>
                                    )}

                                    {/* Quote Items */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Cotización
                                            </h4>
                                            <Button
                                                variant="outline" size="sm" className="h-7 text-xs"
                                                onClick={() => {
                                                    setQuoteProspectId(selectedProspect.id);
                                                    setShowQuoteDialog(true);
                                                }}
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Agregar
                                            </Button>
                                        </div>

                                        {(selectedProspect.quoteItems || []).length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedProspect.quoteItems.map((item: any) => (
                                                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/20 group/item">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium truncate">{item.service}</p>
                                                            {item.description && (
                                                                <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0 ml-3">
                                                            <span className="text-xs text-muted-foreground">{item.quantity}x</span>
                                                            <span className="text-sm font-semibold">${(item.unitPrice * item.quantity).toLocaleString("es-CL")}</span>
                                                            <button
                                                                onClick={() => handleDeleteQuoteItem(item.id)}
                                                                className="opacity-0 group-hover/item:opacity-100 text-destructive hover:bg-destructive/10 p-1 rounded transition-all"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                                    <span className="text-sm font-semibold">Total</span>
                                                    <span className="text-lg font-bold text-emerald-600">${quoteTotal.toLocaleString("es-CL")}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-muted-foreground/50 text-sm">
                                                Sin items de cotización
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Select value={selectedProspect.status} onValueChange={(val) => handleStatusChange(selectedProspect.id, val)}>
                                            <SelectTrigger className="flex-1 h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(statusConfig).map(([key, s]) => (
                                                    <SelectItem key={key} value={key}>{s.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedProspect.status === "COTIZADO" && (
                                            <Button
                                                onClick={() => handleConvert(selectedProspect.id)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                                            >
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Convertir a Cliente
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* New Prospect Dialog */}
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Nuevo Prospecto</DialogTitle>
                    </DialogHeader>
                    <form action={createAction} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input id="name" name="name" placeholder="Nombre del contacto" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" name="phone" placeholder="+56 9..." />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="company">Empresa</Label>
                                <Input id="company" name="company" placeholder="Nombre de la empresa" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="source">Origen</Label>
                                <Select name="source">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sourceOptions.map((opt) => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea id="notes" name="notes" placeholder="Notas adicionales..." rows={2} />
                        </div>
                        {createState?.message && !createState.success && (
                            <p className="text-sm text-destructive">{createState.message}</p>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
                            <Button type="submit">Crear Prospecto</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Quote Item Dialog */}
            <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Agregar Item a Cotización</DialogTitle>
                    </DialogHeader>
                    <form action={quoteAction} className="space-y-4">
                        <input type="hidden" name="prospectId" value={quoteProspectId} />
                        <div className="grid gap-2">
                            <Label htmlFor="service">Servicio *</Label>
                            <Input id="service" name="service" placeholder="Ej: Community Manager" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Input id="description" name="description" placeholder="Detalle del servicio..." />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Cantidad</Label>
                                <Input id="quantity" name="quantity" type="number" defaultValue={1} min={1} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="unitPrice">Precio Unit. *</Label>
                                <Input id="unitPrice" name="unitPrice" type="number" placeholder="0" min={0} step="any" required />
                            </div>
                        </div>
                        {quoteState?.message && !quoteState.success && (
                            <p className="text-sm text-destructive">{quoteState.message}</p>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowQuoteDialog(false)}>Cancelar</Button>
                            <Button type="submit">Agregar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
