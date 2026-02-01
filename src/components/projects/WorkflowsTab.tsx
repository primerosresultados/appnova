"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Workflow,
    CheckCircle2,
    Circle,
    ChevronRight,
    Plus,
    BookOpen
} from "lucide-react";

import { ApplyWorkflowDialog } from "@/components/projects/ApplyWorkflowDialog";

interface WorkflowsTabProps {
    projectId: string;
    projectWorkflows: any[];
    availableWorkflows?: any[];
    isClient?: boolean;
}

export function WorkflowsTab({ projectId, projectWorkflows, availableWorkflows = [], isClient = false }: WorkflowsTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-balanced">Flujos de Trabajo del Proyecto</h2>
                    <p className="text-sm text-muted-foreground text-balanced">Plantillas de trabajo aplicadas con sus respectivas etapas y tareas.</p>
                </div>
                {!isClient && <ApplyWorkflowDialog projectId={projectId} availableWorkflows={availableWorkflows} />}
            </div>

            {projectWorkflows.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-xl bg-card">
                    <Workflow className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No hay flujos de trabajo aplicados</h3>
                    <p className="text-muted-foreground mb-6">Añade una estructura de trabajo predefinida para este proyecto.</p>
                    {!isClient && <ApplyWorkflowDialog projectId={projectId} availableWorkflows={availableWorkflows} />}
                </div>
            ) : (
                <div className="space-y-8">
                    {projectWorkflows.map((pw) => (
                        <div key={pw.id} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Workflow className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">{pw.workflow.name}</h3>
                                    <p className="text-sm text-muted-foreground">{pw.workflow.description}</p>
                                </div>
                                <Badge className="ml-auto bg-emerald-500/10 text-emerald-500 border-none">
                                    {pw.status}
                                </Badge>
                            </div>

                            <div className="grid gap-6">
                                {pw.workflow.stages.map((stage: any, sIdx: number) => (
                                    <Card key={stage.id} className="bg-card border-border/50 overflow-hidden">
                                        <CardHeader className="bg-muted/50 py-3 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary/20 text-primary">
                                                    {sIdx + 1}
                                                </Badge>
                                                <CardTitle className="text-base">{stage.title}</CardTitle>
                                            </div>
                                            {stage.description && (
                                                <CardDescription className="text-xs italic">{stage.description}</CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-border/30">
                                                {stage.tasks.map((task: any) => (
                                                    <div key={task.id} className="flex items-center justify-between p-3 px-6 hover:bg-primary/5 transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-4 w-4 rounded-sm border border-primary/30 group-hover:border-primary flex items-center justify-center transition-colors">
                                                                {/* Example checkmark if completed, for now empty as checklist item */}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{task.title}</p>
                                                                {task.description && (
                                                                    <p className="text-[10px] text-muted-foreground">{task.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                                                    </div>
                                                ))}
                                                {stage.tasks.length === 0 && (
                                                    <div className="p-4 text-center text-xs text-muted-foreground">
                                                        Esta etapa no tiene sub-tareas definidas.
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
