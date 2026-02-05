
import { ActionLogPanel } from "@/components/projects/ActionLogPanel";
import { getProjectLogs } from "@/app/projects/actions-fetchers";

export default async function ActionLogSlot({ projectId, currentUser }: { projectId: string, currentUser: any }) {
    const logs = await getProjectLogs(projectId);
    return <ActionLogPanel projectId={projectId} logs={logs} currentUser={currentUser} />;
}
