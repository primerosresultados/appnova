
import { WorkflowsTab as WorkflowsView } from "@/components/projects/WorkflowsTab";
import { getProjectWorkflows } from "@/app/projects/actions-fetchers";
import { getWorkflows } from "@/app/workflows/actions";

export default async function WorkflowsTab({ projectId, isClient }: { projectId: string, isClient: boolean }) {
    const [projectWorkflows, allWorkflows] = await Promise.all([
        getProjectWorkflows(projectId),
        getWorkflows()
    ]);

    return (
        <WorkflowsView
            projectId={projectId}
            projectWorkflows={projectWorkflows}
            availableWorkflows={allWorkflows}
            isClient={isClient}
        />
    );
}
