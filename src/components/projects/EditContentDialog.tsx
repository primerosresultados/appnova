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
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { updateContent } from "@/app/projects/content-actions";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MediaPreview } from "./MediaPreview";

interface EditContentDialogProps {
    content: any;
    projectId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditContentDialog({ content, projectId, open, onOpenChange }: EditContentDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState<Date | undefined>(content.publishDate ? new Date(content.publishDate) : undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(content.mediaUrl);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPreviewUrl(e.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        if (date) {
            formData.set("publishDate", date.toISOString());
        }

        const result = await updateContent(content.id, projectId, formData);

        if (result.success) {
            toast.success("Contenido actualizado");
            onOpenChange(false);
        } else {
            toast.error("Error al actualizar contenido");
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Contenido</DialogTitle>
                    <DialogDescription>
                        Actualiza los detalles de esta pieza de contenido.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" required defaultValue={content.title} />
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo</Label>
                                <Select name="type" defaultValue={content.type} required>
                                    <SelectTrigger>
                                        <SelectValue />
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
                                <Label htmlFor="status">Estado</Label>
                                <Select name="status" defaultValue={content.status} required>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Borrador</SelectItem>
                                        <SelectItem value="REVIEW">Revisión</SelectItem>
                                        <SelectItem value="APPROVED">Aprobado</SelectItem>
                                        <SelectItem value="SCHEDULED">Programado</SelectItem>
                                        <SelectItem value="PUBLISHED">Publicado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Fecha de Publicación</Label>
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
                        <Textarea id="description" name="description" defaultValue={content.description || ""} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mediaUrl">URL de Previsualización (Drive, YouTube, Imagen)</Label>
                        <Input id="mediaUrl" name="mediaUrl" defaultValue={content.mediaUrl || ""} onChange={handleUrlChange} />
                        <div className="aspect-video w-full mt-2 rounded-lg border border-border/50 overflow-hidden">
                            <MediaPreview url={previewUrl} type={content.type} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="links">Link Final (Opcional)</Label>
                        <Input id="links" name="links" defaultValue={content.links || ""} placeholder="https://..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
