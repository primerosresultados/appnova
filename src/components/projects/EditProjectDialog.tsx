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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { updateProject } from "@/app/projects/actions";
import { toast } from "react-hot-toast";
import { Image, Film, BookImage, LayoutGrid, Radio, Mail, PenLine } from "lucide-react";

interface EditProjectDialogProps {
    project: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const contentFields = [
    { name: "graficas", label: "Gráficas", icon: Image, color: "text-pink-500" },
    { name: "reels", label: "Reels", icon: Film, color: "text-purple-500" },
    { name: "historias", label: "Historias", icon: BookImage, color: "text-orange-500" },
    { name: "carruseles", label: "Carruseles", icon: LayoutGrid, color: "text-blue-500" },
    { name: "lives", label: "Lives", icon: Radio, color: "text-red-500" },
    { name: "mailings", label: "Mailing", icon: Mail, color: "text-cyan-500" },
    { name: "postSeos", label: "Post SEO", icon: PenLine, color: "text-emerald-500" },
];

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(event.currentTarget);
            const result = await updateProject(project.id, formData);

            if (result.success) {
                toast.success("Proyecto actualizado");
                onOpenChange(false);
            } else {
                toast.error(result.message || "Error al actualizar proyecto");
            }
        } catch (err: any) {
            console.error("[EditProjectDialog] Submit error:", err);
            toast.error("Error de conexión al guardar");
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Proyecto</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles y la cantidad de contenido planificado.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-5 py-4">
                    {/* Basic Info */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" defaultValue={project.name} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select name="status" defaultValue={project.status}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Activo</SelectItem>
                                    <SelectItem value="ALERT">Alerta</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Prioridad</Label>
                            <Select name="priority" defaultValue={project.priority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Baja</SelectItem>
                                    <SelectItem value="MEDIUM">Media</SelectItem>
                                    <SelectItem value="HIGH">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" defaultValue={project.description || ""} rows={2} />
                    </div>

                    <Separator />

                    {/* Content Counts Section */}
                    <div>
                        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
                            Contenido Planificado
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {contentFields.map(({ name, label, icon: Icon, color }) => (
                                <div key={name} className="flex items-center gap-2 p-2 rounded-lg border border-border/40 bg-card">
                                    <Icon className={`h-4 w-4 ${color} shrink-0`} />
                                    <Label htmlFor={name} className="text-xs font-medium flex-1 whitespace-nowrap">{label}</Label>
                                    <Input
                                        id={name}
                                        name={name}
                                        type="number"
                                        min="0"
                                        defaultValue={project[name] || 0}
                                        className="w-14 h-7 text-center text-sm px-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
