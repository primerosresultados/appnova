"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { updateWorkflow, deleteWorkflow } from "@/app/workflows/actions";
import { toast } from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Task {
    id?: string;
    title: string;
    description: string;
    order: number;
}

interface Stage {
    id?: string;
    title: string;
    description: string;
    order: number;
    tasks: Task[];
}

interface EditWorkflowDialogProps {
    workflow: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditWorkflowDialog({ workflow, open, onOpenChange }: EditWorkflowDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [stages, setStages] = useState<Stage[]>([]);

    useEffect(() => {
        if (workflow && open) {
            setName(workflow.name || "");
            setDescription(workflow.description || "");
            setCategory(workflow.category || "");
            setStages(workflow.stages?.map((s: any) => ({
                id: s.id,
                title: s.title,
                description: s.description || "",
                order: s.order,
                tasks: s.tasks?.map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    description: t.description || "",
                    order: t.order
                })) || []
            })) || []);
        }
    }, [workflow, open]);

    const addStage = () => {
        setStages([...stages, { title: `Nueva Etapa`, description: "", order: stages.length + 1, tasks: [] }]);
    };

    const removeStage = (index: number) => {
        const newStages = stages.filter((_, i) => i !== index);
        setStages(newStages.map((s, i) => ({ ...s, order: i + 1 })));
    };

    const updateStage = (index: number, field: keyof Stage, value: any) => {
        const newStages = [...stages];
        newStages[index] = { ...newStages[index], [field]: value };
        setStages(newStages);
    };

    const addTask = (stageIndex: number) => {
        const newStages = [...stages];
        newStages[stageIndex].tasks.push({ title: "", description: "", order: newStages[stageIndex].tasks.length + 1 });
        setStages(newStages);
    };

    const removeTask = (stageIndex: number, taskIndex: number) => {
        const newStages = [...stages];
        newStages[stageIndex].tasks = newStages[stageIndex].tasks.filter((_, i) => i !== taskIndex).map((t, i) => ({ ...t, order: i + 1 }));
        setStages(newStages);
    };

    const updateTask = (stageIndex: number, taskIndex: number, field: keyof Task, value: any) => {
        const newStages = [...stages];
        newStages[stageIndex].tasks[taskIndex] = { ...newStages[stageIndex].tasks[taskIndex], [field]: value };
        setStages(newStages);
    };

    const handleSubmit = async () => {
        if (!name) {
            toast.error("El nombre del flujo es obligatorio.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updateWorkflow(workflow.id, {
                name,
                description,
                category,
                stages
            });

            if (result.success) {
                toast.success("Flujo de trabajo actualizado.");
                onOpenChange(false);
            } else {
                toast.error("Error al actualizar el flujo.");
            }
        } catch (error) {
            toast.error("Error inesperado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteWorkflow(workflow.id);
            if (result.success) {
                toast.success("Flujo eliminado.");
                onOpenChange(false);
            } else {
                toast.error("Error al eliminar.");
            }
        } catch (error) {
            toast.error("Error inesperado.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <DialogTitle>Editar Flujo de Trabajo</DialogTitle>
                        <DialogDescription>
                            Modifica la estructura de este flujo.
                        </DialogDescription>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente este flujo y sus etapas.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nombre del Flujo</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Categoría</Label>
                            <Input
                                id="edit-category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-description">Descripción</Label>
                        <Textarea
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Etapas del Proceso</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addStage}>
                                <Plus className="mr-2 h-3 w-3" /> Añadir Etapa
                            </Button>
                        </div>

                        {stages.map((stage, sIndex) => (
                            <div key={sIndex} className="p-4 border rounded-lg bg-card/50 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                        {sIndex + 1}
                                    </div>
                                    <Input
                                        className="font-medium"
                                        value={stage.title}
                                        onChange={(e) => updateStage(sIndex, "title", e.target.value)}
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeStage(sIndex)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="pl-10 space-y-3">
                                    {stage.tasks.map((task, tIndex) => (
                                        <div key={tIndex} className="flex gap-2 items-start">
                                            <Input
                                                value={task.title}
                                                onChange={(e) => updateTask(sIndex, tIndex, "title", e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-50" onClick={() => removeTask(sIndex, tIndex)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="ghost" size="sm" className="w-full border-dashed border h-8 text-xs gap-2" onClick={() => addTask(sIndex)}>
                                        <Plus className="h-3 w-3" /> Añadir Sub-tarea
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
