"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import toast from "react-hot-toast";
import { createFinancialRecord } from "@/app/clients/actions";
import { es } from "date-fns/locale";

interface NewFinancialRecordDialogProps {
    clientId: string;
}

export function NewFinancialRecordDialog({ clientId }: NewFinancialRecordDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>(new Date());

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            amount: formData.get("amount"),
            type: formData.get("type"),
            description: formData.get("description"),
            status: formData.get("status"),
            date: date.toISOString(),
        };

        try {
            const result = await createFinancialRecord(clientId, data);
            if (result.success) {
                toast.success("Registro financiero creado");
                setOpen(false);
                // Reset form? controlled inputs better but native form is fine for now
            } else {
                toast.error(result.error || "Error al crear registro");
            }
        } catch (error) {
            toast.error("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary h-10 px-6 rounded-xl border border-primary/20 shadow-none transition-all">
                    <Plus className="h-4 w-4 mr-2" /> Nuevo Registro
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Registro Financiero</DialogTitle>
                    <DialogDescription>
                        Registra una factura, pago o compromiso financiero para este cliente.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select name="type" defaultValue="PAYMENT" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PAYMENT">Pago Realizado</SelectItem>
                                    <SelectItem value="COMMITMENT">Compromiso de Pago</SelectItem>
                                    <SelectItem value="REFUND">Reembolso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Estado / Factura</Label>
                            <Select name="status" defaultValue="FACTURA_EMITIDA" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Estado de la factura" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pendiente</SelectItem>
                                    <SelectItem value="COMPLETED">Completado</SelectItem>
                                    <SelectItem value="OVERDUE">Vencido</SelectItem>
                                    <SelectItem value="FACTURA_EMITIDA">Factura Emitida</SelectItem>
                                    <SelectItem value="FACTURA_ENVIADA">Factura Enviada</SelectItem>
                                    <SelectItem value="FACTURA_PAGADA">Factura Pagada</SelectItem>
                                    <SelectItem value="FACTURA_RECHAZADA">Factura Rechazada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto (CLP)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input id="amount" name="amount" type="number" placeholder="0" className="pl-7" required />
                            </div>
                        </div>
                        <div className="space-y-2 flex flex-col pt-1">
                            <Label>Fecha</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        {date ? (
                                            format(date, "PPP", { locale: es })
                                        ) : (
                                            <span>Seleccionar fecha</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => d && setDate(d)}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" placeholder="Detalles de la transacción, N° de factura, etc." required />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Registro
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
