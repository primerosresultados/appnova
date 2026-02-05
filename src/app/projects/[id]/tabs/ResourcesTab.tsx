
import { ResourcesTab as ResourcesView } from "@/components/projects/ResourcesTab";
import { getProjectResources } from "@/app/projects/actions-fetchers";

export default async function ResourcesTab({ projectId }: { projectId: string }) {
    const resources = await getProjectResources(projectId);
    return <ResourcesView projectId={projectId} resources={resources} />;
}
