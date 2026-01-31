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
import { uploadFile } from "@/app/actions/upload-actions";
import { Upload, X, FileIcon, ImageIcon } from "lucide-react";

interface NewContentDialogProps {
    projectId: string;
}

export function NewContentDialog({ projectId }: NewContentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState<Date>();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        if (url && (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes('drive.google.com'))) {
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            // Create object URL for preview if it's an image
            if (e.target.files[0].type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(e.target.files[0]));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        if (date) {
            formData.set("publishDate", date.toISOString());
        }

        // Handle File Upload
        if (selectedFile) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", selectedFile);
            const uploadResult = await uploadFile(uploadFormData);

            if (uploadResult.success && uploadResult.url) {
                formData.set("fileUrl", uploadResult.url);
                // If it's an image and no mediaUrl provided, use it as mediaUrl too
                if (selectedFile.type.startsWith('image/') && !formData.get("mediaUrl")) {
                    formData.set("mediaUrl", uploadResult.url);
                }
            } else {
                toast.error("Error al subir archivo");
                setIsSubmitting(false);
                return;
            }
        }

        const result = await createContent(projectId, formData);

        if (result.success) {
            toast.success("Contenido creado correctamente");
            setOpen(false);
            setDate(undefined);
            setPreviewUrl(null);
            setSelectedFile(null);
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
            <DialogContent className="sm:max-w-[500px]">
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
                        <Label>Multimedia / Archivos</Label>

                        <div className="flex gap-2 mb-2">
                            <div className="flex-1">
                                <Label htmlFor="mediaUrl" className="text-xs text-muted-foreground mb-1 block">URL Externa (Drive, Link)</Label>
                                <Input id="mediaUrl" name="mediaUrl" placeholder="https://..." onChange={handleUrlChange} />
                            </div>

                        </div>

                        <div className="border border-dashed border-border rounded-md p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors relative">
                            {previewUrl ? (
                                <div className="relative w-full h-32 rounded-md overflow-hidden">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-1 right-1 h-6 w-6"
                                        onClick={() => {
                                            setPreviewUrl(null);
                                            setSelectedFile(null);
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : selectedFile ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileIcon className="h-8 w-8 text-primary" />
                                    <span>{selectedFile.name}</span>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() => {
                                            setSelectedFile(null);
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-muted-foreground/50" />
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Arrastra un archivo o haz clic para subir</p>
                                        <p className="text-xs text-muted-foreground/60">(Máx 5MB)</p>
                                    </div>
                                    <Input
                                        type="file"
                                        name="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                </>
                            )}
                        </div>

                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Crear Contenido"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
