
import { ConversionsTabClient } from "@/components/projects/ConversionsTab";
import { getProjectConversions } from "@/app/projects/actions-fetchers";

export default async function ConversionsTab({ projectId }: { projectId: string }) {
    const conversions = await getProjectConversions(projectId);
    return <ConversionsTabClient projectId={projectId} conversions={conversions} />;
}
