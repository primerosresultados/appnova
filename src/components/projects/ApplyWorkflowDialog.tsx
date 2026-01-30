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
import { Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { applyWorkflow } from "@/app/projects/workflow-actions";

interface ApplyWorkflowDialogProps {
    projectId: string;
    availableWorkflows: any[];
}

export function ApplyWorkflowDialog({ projectId, availableWorkflows }: ApplyWorkflowDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        if (!selectedWorkflow) return;

        setLoading(true);
        try {
            const result = await applyWorkflow(projectId, selectedWorkflow);
            if (result.success) {
                toast.success("Flujo de trabajo aplicado correctamente");
                setOpen(false);
                setSelectedWorkflow("");
            } else {
                toast.error(result.error || "Error al aplicar el flujo");
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2" variant="outline">
                    <Plus className="h-4 w-4" /> Aplicar Plantilla
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Aplicar Plantilla de Trabajo</DialogTitle>
                    <DialogDescription>
                        Selecciona un flujo de trabajo de la biblioteca para aplicarlo a este proyecto.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="workflow">Flujo de Trabajo</Label>
                        <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar plantilla..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableWorkflows.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        No hay plantillas disponibles.
                                    </div>
                                ) : (
                                    availableWorkflows.map((wf) => (
                                        <SelectItem key={wf.id} value={wf.id}>
                                            {wf.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedWorkflow && (
                        <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                            {availableWorkflows.find(w => w.id === selectedWorkflow)?.description || "Sin descripción"}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleApply} disabled={!selectedWorkflow || loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Aplicar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
