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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DollarSign, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { processPayroll } from "@/app/actions/hr-actions"; // identifying the action we will create
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
}

interface ProcessPayrollDialogProps {
    accounts: Account[];
    totalMonthlySalary: number;
    activeEmployeeCount: number;
}

export function ProcessPayrollDialog({ accounts, totalMonthlySalary, activeEmployeeCount }: ProcessPayrollDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>(new Date());

    // We only need account selection
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccountId) {
            toast.error("Selecciona una cuenta para el pago.");
            return;
        }

        setLoading(true);
        try {
            const result = await processPayroll(selectedAccountId, date);
            if (result.success) {
                toast.success(result.message);
                setOpen(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Error al procesar la nómina.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Procesar Nómina
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Procesar Nómina Mensual</DialogTitle>
                    <DialogDescription>
                        Generar transacciones de egreso para {activeEmployeeCount} colaboradores activos.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-muted-foreground">Total a Pagar:</span>
                            <span className="text-lg font-bold text-emerald-600">${totalMonthlySalary.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Se generará un egreso individual por cada colaborador activo.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Cuenta de Origen</Label>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cuenta bancaria" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.name} (Disp: ${acc.balance.toLocaleString()})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 flex flex-col pt-1">
                        <Label>Fecha de Registro</Label>
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

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !selectedAccountId || activeEmployeeCount === 0}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Pago
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
