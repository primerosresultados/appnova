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
import { createTransaction } from "@/app/actions/finance-actions";
import { es } from "date-fns/locale";

interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
}

interface NewTransactionDialogProps {
    accounts: Account[];
}

export function NewTransactionDialog({ accounts }: NewTransactionDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [transactionType, setTransactionType] = useState("INCOME");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        // Append date manually as it's a state
        formData.set("date", date.toISOString());

        try {
            const result = await createTransaction(formData);
            if (result.success) {
                toast.success("Transacción registrada correctamente");
                setOpen(false);
                // Reset form manually or by key if needed, but closing dialog is usually enough
            } else {
                toast.error(result.error || "Error al crear transacción");
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
                <Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4 mr-2" /> Nueva Transacción
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Nueva Transacción</DialogTitle>
                    <DialogDescription>
                        Registra un ingreso o gasto manual en tus cuentas.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Movimiento</Label>
                            <Select
                                name="type"
                                defaultValue="INCOME"
                                onValueChange={setTransactionType}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">Ingreso (+)</SelectItem>
                                    <SelectItem value="EXPENSE">Egreso (-)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountId">Cuenta Afectada</Label>
                            <Select name="accountId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar cuenta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.length === 0 ? (
                                        <SelectItem value="no-account" disabled>No hay cuentas disponibles</SelectItem>
                                    ) : (
                                        accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.name} (${acc.balance.toLocaleString()})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {accounts.length === 0 && (
                                <p className="text-[10px] text-red-500">Debes crear una cuenta primero.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto (CLP)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input id="amount" name="amount" type="number" placeholder="0" className="pl-7" required min="1" />
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
                            <input type="hidden" name="date" value={date.toISOString()} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select name="category" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {transactionType === "INCOME" ? (
                                    <>
                                        <SelectItem value="Ventas">Ventas / Servicios</SelectItem>
                                        <SelectItem value="Inversión">Inversión</SelectItem>
                                        <SelectItem value="Devolución">Devolución</SelectItem>
                                        <SelectItem value="Otro Ingreso">Otro</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value="Proveedores">Proveedores</SelectItem>
                                        <SelectItem value="Oficina">Gastos de Oficina</SelectItem>
                                        <SelectItem value="Software">Software / Servicios</SelectItem>
                                        <SelectItem value="Nómina">Sueldos y Honorarios</SelectItem>
                                        <SelectItem value="Marketing">Marketing / Publicidad</SelectItem>
                                        <SelectItem value="Impuestos">Impuestos</SelectItem>
                                        <SelectItem value="Otro Gasto">Otro</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" placeholder="Detalle del movimiento..." required />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || accounts.length === 0}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar Transacción
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
