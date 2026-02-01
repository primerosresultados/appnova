"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, ChevronRight, Layers, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { EditWorkflowDialog } from "@/components/workflows/EditWorkflowDialog";

interface WorkflowListProps {
    workflows: any[];
}

export function WorkflowList({ workflows }: WorkflowListProps) {
    const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleEdit = (wf: any) => {
        setSelectedWorkflow(wf);
        setIsEditOpen(true);
    };

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workflows.map((wf) => (
                    <Card
                        key={wf.id}
                        onClick={() => handleEdit(wf)}
                        className="bg-card backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all duration-300 group cursor-pointer overflow-hidden"
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                    {wf.category || "General"}
                                </Badge>
                                <Workflow className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <CardTitle className="mt-2 text-xl group-hover:text-primary transition-colors">{wf.name}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">
                                {wf.description || "Sin descripción."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5" />
                                    <span>{wf.stages?.length || 0} Etapas</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ListChecks className="h-3.5 w-3.5" />
                                    <span>{wf.stages?.reduce((acc: number, s: any) => acc + (s.tasks?.length || 0), 0) || 0} Tareas</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Actualizado recientemente</span>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedWorkflow && (
                <EditWorkflowDialog
                    workflow={selectedWorkflow}
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                />
            )}
        </>
    );
}
