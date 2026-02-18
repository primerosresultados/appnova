"use client";

import { useState, useActionState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Plus, Search, Phone, Mail, Building2, Globe, MessageSquare,
    Trash2, UserPlus, DollarSign, MoreHorizontal,
    ArrowRight, X, FileText, TrendingUp, LayoutGrid, Columns3,
    Pencil, Clock, Target, ChevronDown, Sparkles, Calendar, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import {
    createProspect, updateProspectStatus, deleteProspect,
    addQuoteItem, deleteQuoteItem, convertToClient, updateProspect, updateQuoteSettings
} from "@/app/prospectos/actions";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig: Record<string, {
    label: string;
    color: string;
    bg: string;
    accent: string;
    icon: string;
    dotColor: string;
}> = {
    NUEVO: {
        label: "Nuevo",
        color: "text-blue-600",
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        accent: "from-blue-500 to-blue-600",
        icon: "🆕",
        dotColor: "bg-blue-500",
    },
    CONTACTADO: {
        label: "Contactado",
        color: "text-amber-600",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        accent: "from-amber-500 to-amber-600",
        icon: "📞",
        dotColor: "bg-amber-500",
    },
    COTIZADO: {
        label: "Cotizado",
        color: "text-purple-600",
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        accent: "from-purple-500 to-purple-600",
        icon: "💰",
        dotColor: "bg-purple-500",
    },
    GANADO: {
        label: "Ganado",
        color: "text-emerald-600",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        accent: "from-emerald-500 to-emerald-600",
        icon: "🎉",
        dotColor: "bg-emerald-500",
    },
    PERDIDO: {
        label: "Perdido",
        color: "text-red-500",
        bg: "bg-red-50 text-red-600 border-red-200",
        accent: "from-red-400 to-red-500",
        icon: "❌",
        dotColor: "bg-red-400",
    },
};

const pipelineStatuses = ["NUEVO", "CONTACTADO", "COTIZADO", "GANADO", "PERDIDO"];

const sourceOptions = [
    "Referido", "Website", "Instagram", "Facebook", "LinkedIn", "Google", "Llamada", "Email", "Otro"
];

interface ProspectosClientProps {
    initialProspects: any[];
    organization?: any;
}

export function ProspectosClient({ initialProspects, organization }: ProspectosClientProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [selectedProspect, setSelectedProspect] = useState<any | null>(null);
    const [showQuoteDialog, setShowQuoteDialog] = useState(false);
    const [quoteProspectId, setQuoteProspectId] = useState<string>("");
    const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");
    const [editingProspect, setEditingProspect] = useState<any | null>(null);

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
        return matchesSearch;
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
    const wonValue = initialProspects
        .filter(p => p.status === "GANADO")
        .reduce((sum: number, p: any) =>
            sum + (p.quoteItems || []).reduce((s: number, q: any) => s + (q.unitPrice * q.quantity), 0), 0
        );
    const conversionRate = total > 0 ? Math.round((byStatus.GANADO || 0) / total * 100) : 0;

    const handleStatusChange = async (id: string, newStatus: string) => {
        const result = await updateProspectStatus(id, newStatus);
        if (result.success) {
            toast.success("Estado actualizado");
            if (selectedProspect?.id === id) {
                setSelectedProspect({ ...selectedProspect, status: newStatus });
            }
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
            setSelectedProspect(null);
            router.refresh();
        } else {
            toast.error(result.message || "Error al convertir");
        }
    };

    const handleEditSave = async () => {
        if (!editingProspect) return;
        const result = await updateProspect(editingProspect.id, {
            name: editingProspect.name,
            email: editingProspect.email || null,
            phone: editingProspect.phone || null,
            company: editingProspect.company || null,
            source: editingProspect.source || null,
            notes: editingProspect.notes || null,
        });
        if (result.success) {
            toast.success("Prospecto actualizado");
            setEditingProspect(null);
            setSelectedProspect(null);
            router.refresh();
        } else {
            toast.error(result.message || "Error al actualizar");
        }
    };

    const getQuoteTotal = (prospect: any) => {
        return (prospect.quoteItems || []).reduce(
            (sum: number, item: any) => sum + item.unitPrice * item.quantity, 0
        );
    };

    const getQuoteCalcs = (prospect: any) => {
        const subtotal = getQuoteTotal(prospect);
        const discountPct = prospect.quoteDiscount || 0;
        const discountAmount = subtotal * (discountPct / 100);
        const afterDiscount = subtotal - discountAmount;
        const taxPct = prospect.quoteTaxRate || 0;
        const taxAmount = afterDiscount * (taxPct / 100);
        const total = afterDiscount + taxAmount;
        return { subtotal, discountPct, discountAmount, afterDiscount, taxPct, taxAmount, total };
    };

    const handleSaveQuoteSettings = async (prospectId: string, field: string, value: any) => {
        await updateQuoteSettings(prospectId, { [field]: value });
        router.refresh();
    };

    const generateQuotePDF = async (prospect: any) => {
        const jsPDF = (await import('jspdf')).default;
        await import('jspdf-autotable');

        const doc = new jsPDF();
        const calcs = getQuoteCalcs(prospect);
        const orgName = organization?.name || 'Nova Partners';
        const today = format(new Date(), "dd/MM/yyyy");
        const validDays = prospect.quoteValidDays || 15;
        const validUntil = format(new Date(Date.now() + validDays * 86400000), "dd/MM/yyyy");

        // ─── Header ───
        doc.setFillColor(37, 99, 235); // blue-600
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(orgName, 20, 22);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('COTIZACIÓN', 20, 32);

        // Quote number & date (right side)
        doc.setFontSize(10);
        doc.text(`Fecha: ${today}`, 190, 22, { align: 'right' });
        doc.text(`Válida hasta: ${validUntil}`, 190, 30, { align: 'right' });

        // ─── Client Info ───
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Datos del Prospecto', 20, 55);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let yPos = 63;
        doc.text(`Nombre: ${prospect.name}`, 20, yPos);
        if (prospect.company) { yPos += 6; doc.text(`Empresa: ${prospect.company}`, 20, yPos); }
        if (prospect.email) { yPos += 6; doc.text(`Email: ${prospect.email}`, 20, yPos); }
        if (prospect.phone) { yPos += 6; doc.text(`Teléfono: ${prospect.phone}`, 20, yPos); }

        // ─── Items Table ───
        const items = (prospect.quoteItems || []).map((item: any, i: number) => [
            i + 1,
            item.service,
            item.description || '-',
            item.quantity,
            `$${item.unitPrice.toLocaleString('es-CL')}`,
            `$${(item.unitPrice * item.quantity).toLocaleString('es-CL')}`,
        ]);

        (doc as any).autoTable({
            startY: yPos + 12,
            head: [['#', 'Servicio', 'Descripción', 'Cant.', 'P. Unit.', 'Subtotal']],
            body: items,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                3: { cellWidth: 15, halign: 'center' },
                4: { cellWidth: 28, halign: 'right' },
                5: { cellWidth: 30, halign: 'right' },
            },
            margin: { left: 20, right: 20 },
        });

        // ─── Totals ───
        const finalY = (doc as any).lastAutoTable.finalY + 8;
        const rightX = 190;
        doc.setFontSize(10);

        let totY = finalY;
        doc.text('Subtotal:', rightX - 45, totY);
        doc.text(`$${calcs.subtotal.toLocaleString('es-CL')}`, rightX, totY, { align: 'right' });

        if (calcs.discountPct > 0) {
            totY += 7;
            doc.text(`Descuento (${calcs.discountPct}%):`, rightX - 45, totY);
            doc.setTextColor(220, 38, 38);
            doc.text(`-$${calcs.discountAmount.toLocaleString('es-CL')}`, rightX, totY, { align: 'right' });
            doc.setTextColor(60, 60, 60);
        }

        if (calcs.taxPct > 0) {
            totY += 7;
            doc.text(`IVA (${calcs.taxPct}%):`, rightX - 45, totY);
            doc.text(`$${calcs.taxAmount.toLocaleString('es-CL')}`, rightX, totY, { align: 'right' });
        }

        totY += 9;
        doc.setDrawColor(37, 99, 235);
        doc.line(rightX - 50, totY - 3, rightX, totY - 3);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', rightX - 45, totY + 2);
        doc.setTextColor(37, 99, 235);
        doc.text(`$${Math.round(calcs.total).toLocaleString('es-CL')}`, rightX, totY + 2, { align: 'right' });

        // ─── Notes ───
        if (prospect.quoteNotes) {
            doc.setTextColor(60, 60, 60);
            const notesY = totY + 18;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Notas / Condiciones:', 20, notesY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const lines = doc.splitTextToSize(prospect.quoteNotes, 170);
            doc.text(lines, 20, notesY + 7);
        }

        // ─── Footer ───
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text(`Cotización generada por ${orgName} — ${today}`, 105, 285, { align: 'center' });

        // Download
        const fileName = `Cotización_${prospect.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
        doc.save(fileName);
        toast.success('PDF descargado');
    };

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    // Kanban columns
    const kanbanColumns = useMemo(() => {
        return pipelineStatuses.map(status => ({
            status,
            config: statusConfig[status],
            prospects: filteredProspects.filter(p => p.status === status),
            totalValue: filteredProspects
                .filter(p => p.status === status)
                .reduce((sum: number, p: any) =>
                    sum + (p.quoteItems || []).reduce((s: number, q: any) => s + (q.unitPrice * q.quantity), 0), 0
                ),
        }));
    }, [filteredProspects]);

    // ─── Prospect Card (shared between views) ───
    const ProspectCard = ({ prospect, compact = false }: { prospect: any; compact?: boolean }) => {
        const cfg = statusConfig[prospect.status] || statusConfig.NUEVO;
        const quoteTotal = getQuoteTotal(prospect);
        const hasQuote = (prospect.quoteItems || []).length > 0;
        const timeAgo = formatDistanceToNow(new Date(prospect.createdAt), { locale: es, addSuffix: true });

        return (
            <div
                className={cn(
                    "group rounded-xl border border-border/40 bg-card hover:border-border/80 hover:shadow-md",
                    "transition-all duration-200 cursor-pointer relative overflow-hidden"
                )}
                onClick={() => setSelectedProspect(prospect)}
            >
                <div className={cn("h-0.5 w-full bg-gradient-to-r", cfg.accent)} />
                <div className={cn("p-3.5", compact && "p-3")}>
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "shrink-0 w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold",
                            cfg.accent
                        )}>
                            {getInitials(prospect.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm truncate leading-tight">{prospect.name}</h3>
                            {prospect.company && (
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Building2 className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{prospect.company}</span>
                                </p>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => setEditingProspect({ ...prospect })}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    setQuoteProspectId(prospect.id);
                                    setShowQuoteDialog(true);
                                }}>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Agregar Cotización
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {pipelineStatuses.filter(s => s !== prospect.status).map(key => (
                                    <DropdownMenuItem key={key} onClick={() => handleStatusChange(prospect.id, key)}>
                                        <span className={cn("h-2 w-2 rounded-full mr-2 shrink-0", statusConfig[key].dotColor)} />
                                        Mover a {statusConfig[key].label}
                                    </DropdownMenuItem>
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

                    {/* Quick info tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {prospect.email && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded-md px-1.5 py-0.5">
                                <Mail className="h-2.5 w-2.5" />
                                <span className="truncate max-w-[110px]">{prospect.email}</span>
                            </span>
                        )}
                        {prospect.phone && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded-md px-1.5 py-0.5">
                                <Phone className="h-2.5 w-2.5" />
                                {prospect.phone}
                            </span>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/20">
                        <div className="flex items-center gap-2">
                            {viewMode === "grid" && (
                                <Badge variant="outline" className={cn("text-[10px] h-5 border font-medium", cfg.bg)}>
                                    {cfg.label}
                                </Badge>
                            )}
                            {hasQuote && (
                                <span className="text-xs font-bold text-emerald-600">
                                    ${quoteTotal.toLocaleString("es-CL")}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            {prospect.source && (
                                <span className="flex items-center gap-0.5">
                                    <Globe className="h-2.5 w-2.5" />
                                    {prospect.source}
                                </span>
                            )}
                            <span className="flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {format(new Date(prospect.createdAt), "d MMM", { locale: es })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Prospectos</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Pipeline de ventas y gestión de leads
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border border-border/50 rounded-lg p-0.5 bg-muted/30">
                        <Button
                            variant={viewMode === "kanban" ? "default" : "ghost"}
                            size="sm"
                            className={cn("h-7 px-2.5 text-xs", viewMode !== "kanban" && "text-muted-foreground")}
                            onClick={() => setViewMode("kanban")}
                        >
                            <Columns3 className="h-3.5 w-3.5 mr-1" />
                            Pipeline
                        </Button>
                        <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="sm"
                            className={cn("h-7 px-2.5 text-xs", viewMode !== "grid" && "text-muted-foreground")}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                            Tarjetas
                        </Button>
                    </div>
                    <Button onClick={() => setShowNewDialog(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9">
                        <Plus className="mr-1.5 h-4 w-4" /> Nuevo Prospecto
                    </Button>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="border-border/40 bg-gradient-to-br from-card to-muted/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Prospectos</p>
                                <p className="text-3xl font-bold mt-1">{total}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-gradient-to-br from-card to-blue-50/30 dark:to-blue-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Activos</p>
                                <p className="text-3xl font-bold mt-1">{(byStatus.NUEVO || 0) + (byStatus.CONTACTADO || 0) + (byStatus.COTIZADO || 0)}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Target className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-gradient-to-br from-card to-emerald-50/30 dark:to-emerald-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Tasa Conversión</p>
                                <p className="text-3xl font-bold mt-1 text-emerald-600">{conversionRate}%</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-gradient-to-br from-card to-purple-50/30 dark:to-purple-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">Valor Pipeline</p>
                                <p className="text-2xl font-bold mt-1 text-purple-600">${totalQuoteValue.toLocaleString("es-CL")}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-gradient-to-br from-card to-emerald-50/40 dark:to-emerald-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Valor Ganado</p>
                                <p className="text-2xl font-bold mt-1 text-emerald-600">${wonValue.toLocaleString("es-CL")}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre, empresa o email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 bg-muted/30 border-border/40"
                />
            </div>

            {/* ═══ KANBAN VIEW ═══ */}
            {viewMode === "kanban" && (
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
                    {kanbanColumns.map(({ status, config, prospects, totalValue }) => (
                        <div
                            key={status}
                            className="flex-shrink-0 w-[280px] flex flex-col rounded-xl border border-border/30 bg-muted/15"
                        >
                            {/* Column Header */}
                            <div className="p-3 border-b border-border/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("h-2.5 w-2.5 rounded-full", config.dotColor)} />
                                        <span className="font-semibold text-sm">{config.label}</span>
                                        <span className="text-xs text-muted-foreground bg-muted/50 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                                            {prospects.length}
                                        </span>
                                    </div>
                                </div>
                                {totalValue > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                                        ${totalValue.toLocaleString("es-CL")}
                                    </p>
                                )}
                            </div>

                            {/* Column Cards */}
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] min-h-[120px]">
                                {prospects.length > 0 ? (
                                    prospects.map((prospect) => (
                                        <ProspectCard key={prospect.id} prospect={prospect} compact />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40">
                                        <div className="text-2xl mb-1">{config.icon}</div>
                                        <p className="text-xs">Sin prospectos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ═══ GRID VIEW ═══ */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredProspects.map((prospect) => (
                        <ProspectCard key={prospect.id} prospect={prospect} />
                    ))}
                    {filteredProspects.length === 0 && (
                        <div className="col-span-full text-center py-16 text-muted-foreground">
                            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No hay prospectos</p>
                            <p className="text-sm mt-1 text-muted-foreground/70">Crea tu primer prospecto para empezar</p>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ DETAIL SHEET ═══ */}
            <Sheet open={!!selectedProspect} onOpenChange={(open) => !open && setSelectedProspect(null)}>
                <SheetContent className="sm:max-w-[480px] overflow-y-auto p-0">
                    {selectedProspect && (() => {
                        const cfg = statusConfig[selectedProspect.status] || statusConfig.NUEVO;
                        const quoteTotal = getQuoteTotal(selectedProspect);
                        const timeAgo = formatDistanceToNow(new Date(selectedProspect.createdAt), { locale: es, addSuffix: true });

                        return (
                            <>
                                {/* Header with gradient */}
                                <div className={cn("bg-gradient-to-r p-6 text-white", cfg.accent)}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                                                {getInitials(selectedProspect.name)}
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-lg leading-tight">{selectedProspect.name}</h2>
                                                {selectedProspect.company && (
                                                    <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5">
                                                        <Building2 className="h-3.5 w-3.5" />
                                                        {selectedProspect.company}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                                            {cfg.label}
                                        </Badge>
                                    </div>
                                    <p className="text-white/60 text-xs mt-3 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Creado {timeAgo}
                                    </p>
                                </div>

                                <div className="p-5 space-y-5">
                                    {/* Contact Info */}
                                    <div className="grid grid-cols-1 gap-2">
                                        {selectedProspect.email && (
                                            <a href={`mailto:${selectedProspect.email}`}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm group/link"
                                                onClick={(e) => e.stopPropagation()}>
                                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    <Mail className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <span className="truncate group-hover/link:text-blue-600 transition-colors">{selectedProspect.email}</span>
                                            </a>
                                        )}
                                        {selectedProspect.phone && (
                                            <a href={`tel:${selectedProspect.phone}`}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm group/link"
                                                onClick={(e) => e.stopPropagation()}>
                                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                    <Phone className="h-4 w-4 text-emerald-500" />
                                                </div>
                                                <span className="group-hover/link:text-emerald-600 transition-colors">{selectedProspect.phone}</span>
                                            </a>
                                        )}
                                        {selectedProspect.source && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 text-sm">
                                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                                    <Globe className="h-4 w-4 text-amber-500" />
                                                </div>
                                                <span>Origen: <strong>{selectedProspect.source}</strong></span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    {selectedProspect.notes && (
                                        <div className="bg-muted/20 p-3.5 rounded-lg border border-border/20">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                Notas
                                            </div>
                                            <p className="text-sm leading-relaxed">{selectedProspect.notes}</p>
                                        </div>
                                    )}

                                    {/* Quote Section — Enhanced */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                Cotización
                                            </h4>
                                            <div className="flex items-center gap-1.5">
                                                {(selectedProspect.quoteItems || []).length > 0 && (
                                                    <Button
                                                        variant="outline" size="sm" className="h-7 text-xs gap-1"
                                                        onClick={() => generateQuotePDF(selectedProspect)}
                                                    >
                                                        <Download className="h-3 w-3" /> PDF
                                                    </Button>
                                                )}
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
                                        </div>

                                        {(selectedProspect.quoteItems || []).length > 0 ? (() => {
                                            const calcs = getQuoteCalcs(selectedProspect);
                                            return (
                                                <div className="space-y-3">
                                                    {/* Items table */}
                                                    <div className="rounded-lg border border-border/30 overflow-hidden">
                                                        <div className="grid grid-cols-[1fr_50px_70px_70px_24px] gap-0 text-[10px] font-semibold text-muted-foreground bg-muted/30 px-3 py-2 border-b border-border/20">
                                                            <span>Servicio</span>
                                                            <span className="text-center">Cant.</span>
                                                            <span className="text-right">P.Unit</span>
                                                            <span className="text-right">Subtotal</span>
                                                            <span></span>
                                                        </div>
                                                        {selectedProspect.quoteItems.map((item: any) => (
                                                            <div key={item.id} className="grid grid-cols-[1fr_50px_70px_70px_24px] gap-0 items-center px-3 py-2.5 border-b border-border/10 last:border-0 group/item hover:bg-muted/20 transition-colors">
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium truncate">{item.service}</p>
                                                                    {item.description && (
                                                                        <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-center text-muted-foreground">{item.quantity}</span>
                                                                <span className="text-xs text-right">${item.unitPrice.toLocaleString('es-CL')}</span>
                                                                <span className="text-xs text-right font-semibold">${(item.unitPrice * item.quantity).toLocaleString('es-CL')}</span>
                                                                <button
                                                                    onClick={() => handleDeleteQuoteItem(item.id)}
                                                                    className="opacity-0 group-hover/item:opacity-100 text-destructive hover:bg-destructive/10 p-0.5 rounded transition-all justify-self-center"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Settings row */}
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <label className="text-[10px] text-muted-foreground font-medium">Descuento %</label>
                                                            <Input
                                                                type="number" min={0} max={100} step={1}
                                                                className="h-7 text-xs mt-0.5"
                                                                defaultValue={selectedProspect.quoteDiscount || 0}
                                                                onBlur={(e) => handleSaveQuoteSettings(selectedProspect.id, 'quoteDiscount', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-muted-foreground font-medium">IVA %</label>
                                                            <Input
                                                                type="number" min={0} max={100} step={1}
                                                                className="h-7 text-xs mt-0.5"
                                                                defaultValue={selectedProspect.quoteTaxRate || 0}
                                                                onBlur={(e) => handleSaveQuoteSettings(selectedProspect.id, 'quoteTaxRate', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-muted-foreground font-medium">Validez (días)</label>
                                                            <Input
                                                                type="number" min={1}
                                                                className="h-7 text-xs mt-0.5"
                                                                defaultValue={selectedProspect.quoteValidDays || 15}
                                                                onBlur={(e) => handleSaveQuoteSettings(selectedProspect.id, 'quoteValidDays', parseInt(e.target.value) || 15)}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Notes */}
                                                    <div>
                                                        <label className="text-[10px] text-muted-foreground font-medium">Notas / Condiciones</label>
                                                        <Textarea
                                                            className="text-xs mt-0.5 min-h-[50px]"
                                                            placeholder="Condiciones de pago, alcances, etc..."
                                                            defaultValue={selectedProspect.quoteNotes || ''}
                                                            onBlur={(e) => handleSaveQuoteSettings(selectedProspect.id, 'quoteNotes', e.target.value || null)}
                                                            rows={2}
                                                        />
                                                    </div>

                                                    {/* Totals */}
                                                    <div className="bg-muted/20 rounded-lg p-3 space-y-1.5">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-muted-foreground">Subtotal</span>
                                                            <span>${calcs.subtotal.toLocaleString('es-CL')}</span>
                                                        </div>
                                                        {calcs.discountPct > 0 && (
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-muted-foreground">Descuento ({calcs.discountPct}%)</span>
                                                                <span className="text-red-500">-${calcs.discountAmount.toLocaleString('es-CL')}</span>
                                                            </div>
                                                        )}
                                                        {calcs.taxPct > 0 && (
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-muted-foreground">IVA ({calcs.taxPct}%)</span>
                                                                <span>+${calcs.taxAmount.toLocaleString('es-CL')}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between pt-2 border-t border-border/30">
                                                            <span className="text-sm font-bold">Total</span>
                                                            <span className="text-lg font-bold text-emerald-600">${Math.round(calcs.total).toLocaleString('es-CL')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })() : (
                                            <div className="text-center py-8 text-muted-foreground/40 text-sm border border-dashed border-border/30 rounded-lg">
                                                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                                Sin items de cotización
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-2 pt-2 border-t border-border/20">
                                        <div className="flex gap-2">
                                            <Select value={selectedProspect.status} onValueChange={(val) => handleStatusChange(selectedProspect.id, val)}>
                                                <SelectTrigger className="flex-1 h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(statusConfig).map(([key, s]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <span className="flex items-center gap-2">
                                                                <span className={cn("h-2 w-2 rounded-full shrink-0", s.dotColor)} />
                                                                {s.label}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3"
                                                onClick={() => setEditingProspect({ ...selectedProspect })}
                                            >
                                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                                Editar
                                            </Button>
                                        </div>
                                        {(selectedProspect.status === "COTIZADO" || selectedProspect.status === "CONTACTADO") && (
                                            <Button
                                                onClick={() => handleConvert(selectedProspect.id)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9"
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
                </SheetContent>
            </Sheet>

            {/* ═══ NEW PROSPECT DIALOG ═══ */}
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <UserPlus className="h-4 w-4 text-primary" />
                            </div>
                            Nuevo Prospecto
                        </DialogTitle>
                        <DialogDescription>
                            Agrega un nuevo lead al pipeline de ventas
                        </DialogDescription>
                    </DialogHeader>
                    <form action={createAction} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del contacto *</Label>
                            <Input id="name" name="name" placeholder="Ej: Juan Pérez" required />
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
                                <Input id="company" name="company" placeholder="Nombre empresa" />
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
                            <Textarea id="notes" name="notes" placeholder="Contexto, como llegó, qué necesita..." rows={3} />
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

            {/* ═══ EDIT PROSPECT DIALOG ═══ */}
            <Dialog open={!!editingProspect} onOpenChange={(open) => !open && setEditingProspect(null)}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            Editar Prospecto
                        </DialogTitle>
                    </DialogHeader>
                    {editingProspect && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Nombre *</Label>
                                <Input
                                    value={editingProspect.name}
                                    onChange={(e) => setEditingProspect({ ...editingProspect, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={editingProspect.email || ""}
                                        onChange={(e) => setEditingProspect({ ...editingProspect, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Teléfono</Label>
                                    <Input
                                        value={editingProspect.phone || ""}
                                        onChange={(e) => setEditingProspect({ ...editingProspect, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label>Empresa</Label>
                                    <Input
                                        value={editingProspect.company || ""}
                                        onChange={(e) => setEditingProspect({ ...editingProspect, company: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Origen</Label>
                                    <Select
                                        value={editingProspect.source || ""}
                                        onValueChange={(val) => setEditingProspect({ ...editingProspect, source: val })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>
                                            {sourceOptions.map((opt) => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Notas</Label>
                                <Textarea
                                    value={editingProspect.notes || ""}
                                    onChange={(e) => setEditingProspect({ ...editingProspect, notes: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingProspect(null)}>Cancelar</Button>
                                <Button onClick={handleEditSave}>Guardar Cambios</Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ═══ ADD QUOTE ITEM DIALOG ═══ */}
            <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Agregar Item a Cotización
                        </DialogTitle>
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
                                <Label htmlFor="unitPrice">Precio Unitario *</Label>
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
