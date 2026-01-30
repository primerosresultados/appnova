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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { createContent } from "@/app/projects/content-actions";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface NewContentDialogProps {
    projectId: string;
}

export function NewContentDialog({ projectId }: NewContentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState<Date>();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        if (date) {
            formData.set("publishDate", date.toISOString());
        }

        const result = await createContent(projectId, formData);

        if (result.success) {
            toast.success("Contenido creado correctamente");
            setOpen(false);
            setDate(undefined);
        } else {
            toast.error("Error al crear contenido");
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Contenido
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Contenido</DialogTitle>
                    <DialogDescription>
                        Planifica una nueva pieza de contenido para el proyecto.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" required placeholder="Ej: Post Lanzamiento" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Select name="type" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INSTAGRAM_POST">Instagram Post</SelectItem>
                                <SelectItem value="INSTAGRAM_REEL">Instagram Reel</SelectItem>
                                <SelectItem value="INSTAGRAM_STORY">Instagram Story</SelectItem>
                                <SelectItem value="SEO">Artículo SEO</SelectItem>
                                <SelectItem value="ADS_CAMPAIGN">Campaña Ads</SelectItem>
                                <SelectItem value="EMAIL">Email Marketing</SelectItem>
                                <SelectItem value="OTHER">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Fecha de Publicación (Calendario)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" placeholder="Detalles del contenido..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="mediaUrl">URL de Media (Opcional)</Label>
                        <Input id="mediaUrl" name="mediaUrl" placeholder="https://..." />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creando..." : "Crear Contenido"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
