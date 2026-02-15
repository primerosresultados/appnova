"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Save, Pencil, X } from "lucide-react";
import { updateProject } from "@/app/projects/actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface BuyerPersonaTabProps {
    project: {
        id: string;
        buyerPersona?: string | null;
    };
}

export function BuyerPersonaTab({ project }: BuyerPersonaTabProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(project.buyerPersona || "");
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            const fd = new FormData();
            fd.set("buyerPersona", content);
            const result = await updateProject(project.id, fd);
            if (result.success) {
                toast.success("Buyer Persona guardado");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.message || "Error al guardar");
            }
        });
    };

    const placeholder = `Describe tu Buyer Persona aquí. Algunas ideas:

• Nombre ficticio y datos demográficos (edad, género, ubicación)
• Ocupación e ingresos
• Objetivos y motivaciones principales
• Puntos de dolor y frustraciones
• Canales de comunicación preferidos
• Comportamiento de compra
• Objeciones frecuentes`;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Buyer Persona</h3>
                </div>
                {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setContent(project.buyerPersona || ""); }}>
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
                            <UserCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground mb-1">No hay Buyer Persona definido</p>
                            <p className="text-xs text-muted-foreground/60">Define el perfil de tu cliente ideal para guiar la estrategia de marketing.</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsEditing(true)}>
                                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Crear Buyer Persona
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
