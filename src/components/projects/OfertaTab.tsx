"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Save, Pencil, X } from "lucide-react";
import { updateProject } from "@/app/projects/actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface OfertaTabProps {
    project: {
        id: string;
        oferta?: string | null;
    };
}

export function OfertaTab({ project }: OfertaTabProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(project.oferta || "");
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            const fd = new FormData();
            fd.set("oferta", content);
            const result = await updateProject(project.id, fd);
            if (result.success) {
                toast.success("Oferta guardada");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.message || "Error al guardar");
            }
        });
    };

    const placeholder = `Describe la oferta al mercado de este proyecto. Algunas ideas:

• Productos o servicios principales que se ofrecen
• Propuesta de valor única (UVP)
• Diferenciadores frente a la competencia
• Beneficios clave para el cliente
• Segmento de mercado objetivo
• Pricing o modelo de negocio
• Garantías o respaldos`;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Oferta al Mercado</h3>
                </div>
                {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setContent(project.oferta || ""); }}>
                            <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                            <Save className="h-3.5 w-3.5 mr-1.5" /> {isPending ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                )}
            </div>

            <Card className="border-border/50">
                <CardContent className="p-4">
                    {isEditing ? (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={placeholder}
                            className="w-full min-h-[300px] bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-sm placeholder:text-muted-foreground/50 whitespace-pre-wrap"
                            autoFocus
                        />
                    ) : content ? (
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{content}</div>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground mb-1">No hay oferta definida</p>
                            <p className="text-xs text-muted-foreground/60">Define qué productos o servicios se ofrecen al mercado en este proyecto.</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsEditing(true)}>
                                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Definir Oferta
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
