export const dynamic = 'force-dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Workflow, ChevronRight, Layers, ListChecks } from "lucide-react";
import { NewWorkflowDialog } from "@/components/workflows/NewWorkflowDialog";
import { getWorkflows } from "./actions";
import { Badge } from "@/components/ui/badge";
import { WorkflowList } from "@/components/workflows/WorkflowList";

export default async function WorkflowsPage() {
    let workflows: any[] = [];
    let dbError = null;

    try {
        workflows = await getWorkflows();
    } catch (error: any) {
        console.error("Error fetching workflows:", error);
        dbError = error.message;
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Flujos de Trabajo</h1>
                    <p className="text-muted-foreground">Automatiza procesos y estandariza tareas.</p>
                </div>
                <NewWorkflowDialog />
            </div>

            {/* Error Alert */}
            {dbError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-4 text-sm">
                    <strong>Error de Conexión:</strong> {dbError}
                </div>
            )}

            {workflows.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg bg-card/30">
                    <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No hay flujos de trabajo</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        Crea plantillas de tareas y procesos recurrentes para asignar rápidamente a tus proyectos.
                    </p>
                    <NewWorkflowDialog />
                </div>
            ) : (
                <WorkflowList workflows={workflows} />
            )}
        </div>
    );
}
