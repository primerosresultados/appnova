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
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { createWorkflow } from "@/app/workflows/actions";
import { toast } from "react-hot-toast";

interface Task {
    title: string;
    description: string;
    order: number;
}

interface Stage {
    title: string;
    description: string;
    order: number;
    tasks: Task[];
}

export function NewWorkflowDialog() {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [stages, setStages] = useState<Stage[]>([
        { title: "Etapa 1", description: "", order: 1, tasks: [] }
    ]);

    const addStage = () => {
        setStages([...stages, { title: `Etapa ${stages.length + 1}`, description: "", order: stages.length + 1, tasks: [] }]);
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
            const result = await createWorkflow({
                name,
                description,
                category,
                stages
            });

            if (result.success) {
                toast.success("Flujo de trabajo creado con éxito.");
                setOpen(false);
                // Reset form
                setName("");
                setDescription("");
                setCategory("");
                setStages([{ title: "Etapa 1", description: "", order: 1, tasks: [] }]);
            } else {
                toast.error("Error al crear el flujo de trabajo.");
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Flujo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Flujo de Trabajo</DialogTitle>
                    <DialogDescription>
                        Define una plantilla de trabajo con etapas y tareas para estandarizar tus procesos.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Flujo</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Onboarding de Marketing"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Categoría</Label>
                            <Input
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="Ej: Marketing, Desarrollo, SEO"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe de qué trata este flujo de trabajo..."
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
                            <div key={sIndex} className="p-4 border rounded-lg bg-card space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                        {sIndex + 1}
                                    </div>
                                    <Input
                                        className="font-medium"
                                        value={stage.title}
                                        onChange={(e) => updateStage(sIndex, "title", e.target.value)}
                                        placeholder="Nombre de la etapa"
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeStage(sIndex)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="pl-10 space-y-3">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Sub-tareas de la etapa</Label>
                                    {stage.tasks.map((task, tIndex) => (
                                        <div key={tIndex} className="flex gap-2 items-start">
                                            <div className="grid gap-2 flex-1">
                                                <Input
                                                    size={1}
                                                    value={task.title}
                                                    onChange={(e) => updateTask(sIndex, tIndex, "title", e.target.value)}
                                                    placeholder="Nombre de la tarea"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-50 hover:opacity-100" onClick={() => removeTask(sIndex, tIndex)}>
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
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creando..." : "Crear Flujo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
