"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface InvoicingTabProps {
    invoices: any[];
}

export function InvoicingTab({ invoices }: InvoicingTabProps) {

    // Helper to calculate days status
    const getDaysStatus = (invoice: any) => {
        if (invoice.status === 'FACTURA_PAGADA' || invoice.status === 'COMPLETED') {
            if (invoice.paymentDate && invoice.date) {
                const days = differenceInDays(new Date(invoice.paymentDate), new Date(invoice.date));
                return { label: `Pagado en ${days} días`, color: "text-emerald-500" };
            }
            return { label: "Pagado", color: "text-emerald-500" };
        }

        const now = new Date();
        const issueDate = new Date(invoice.date);
        const daysSinceIssue = differenceInDays(now, issueDate);

        if (invoice.dueDate && new Date(invoice.dueDate) < now) {
            const daysOverdue = differenceInDays(now, new Date(invoice.dueDate));
            return { label: `${daysOverdue} días vencida`, color: "text-rose-500 font-bold" };
        }

        return { label: `${daysSinceIssue} días desde emisión`, color: "text-muted-foreground" };
    };

    return (
        <Card className="bg-card border border-border/40 shadow-lg overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Control de Facturación</CardTitle>
                <CardDescription>Historial completo de facturas y estados de pago.</CardDescription>
            </CardHeader>
            <CardContent>
                {invoices.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">No hay registros de facturación</h3>
                        <p className="max-w-xs mx-auto mt-2">Registra facturas y pagos desde la ficha de cada cliente.</p>
                    </div>
                ) : (
                    <div className="rounded-md border border-border/40">
                        <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary/20 border-b border-border/40">
                            <div className="col-span-2">N° Factura</div>
                            <div className="col-span-3">Cliente</div>
                            <div className="col-span-3">Detalle</div>
                            <div className="col-span-2">Fechas</div>
                            <div className="col-span-2 text-right">Monto / Estado</div>
                        </div>
                        <div className="divide-y divide-border/20">
                            {invoices.map((record: any) => {
                                const daysInfo = getDaysStatus(record);
                                return (
                                    <div key={record.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors">
                                        <div className="col-span-2 font-medium">
                                            {record.invoiceNumber ? (
                                                <span className="flex items-center gap-2">
                                                    <FileText className="h-3 w-3 text-muted-foreground" />
                                                    #{record.invoiceNumber}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">S/N</span>
                                            )}
                                        </div>
                                        <div className="col-span-3 font-medium text-sm truncate">{record.client?.name || "Sin cliente"}</div>
                                        <div className="col-span-3 text-sm text-muted-foreground truncate">{record.description}</div>
                                        <div className="col-span-2 text-xs space-y-1">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <span className="w-14">Emisión:</span>
                                                <span className="font-medium text-foreground">{format(new Date(record.date), 'dd MMM', { locale: es })}</span>
                                            </div>
                                            {record.dueDate && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <span className="w-14">Vence:</span>
                                                    <span className={`font-medium ${new Date(record.dueDate) < new Date() && record.status !== 'FACTURA_PAGADA' ? 'text-rose-500' : 'text-foreground'}`}>
                                                        {format(new Date(record.dueDate), 'dd MMM', { locale: es })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-2 text-right space-y-1">
                                            <div className="font-bold text-base">${record.amount.toLocaleString()}</div>
                                            <Badge variant="outline" className={`text-[9px] h-4 py-0 ${record.status === 'FACTURA_PAGADA' || record.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    record.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                {record.status.replace(/_/g, ' ')}
                                            </Badge>
                                            <div className={`text-[10px] ${daysInfo.color} font-medium`}>
                                                {daysInfo.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
