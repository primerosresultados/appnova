"use client";

import { useActionState, useState, useEffect } from "react";
import { updateContract } from "@/app/actions/finance-actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const initialState = {
    success: false,
    message: ""
};

interface EditAgreementDialogProps {
    contract: any;
    clients: { id: string, name: string }[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditAgreementDialog({ contract, clients, open, onOpenChange }: EditAgreementDialogProps) {
    const updateContractWithId = updateContract.bind(null, contract.id);
    const [state, formAction] = useActionState(updateContractWithId, initialState);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(contract.startDate ? new Date(contract.startDate) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(contract.endDate ? new Date(contract.endDate) : undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success("Acuerdo actualizado correctamente");
            onOpenChange(false);
            setLoading(false);
        } else if (state?.message && !state.success) {
            toast.error(state.message);
            setLoading(false);
        }
    }, [state, onOpenChange]);

    const handleSubmit = (formData: FormData) => {
        if (!startDate) {
            toast.error("Fecha de inicio requerida");
            return;
        }
        formData.set("startDate", startDate.toISOString());
        if (endDate) {
            formData.set("endDate", endDate.toISOString());
        } else {
            formData.set("endDate", "");
        }
        setLoading(true);
        formAction(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Editar Acuerdo Comercial</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del acuerdo comercial.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título del Acuerdo</Label>
                        <Input id="title" name="title" defaultValue={contract.title} placeholder="Ej: Servicio Mensual de Marketing" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientId">Cliente</Label>
                            <Select name="clientId" defaultValue={contract.clientId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input id="amount" name="amount" type="number" defaultValue={contract.amount} className="pl-7" placeholder="0" required />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="frequency">Frecuencia de Pago</Label>
                            <Select name="frequency" required defaultValue={contract.frequency || "MONTHLY"}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                                    <SelectItem value="ANNUALLY">Anual</SelectItem>
                                    <SelectItem value="ONE_OFF">Pago Único</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <Label>Fecha Inicio</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        {startDate ? format(startDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label>Fecha Término (Opcional)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        {endDate ? format(endDate, "PPP", { locale: es }) : <span>Indefinido</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción / Notas</Label>
                        <Textarea id="description" name="description" defaultValue={contract.description || ""} placeholder="Detalles adicionales del acuerdo..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
