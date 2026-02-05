
import { CreativitiesTab as CreativitiesView } from "@/components/projects/CreativitiesTab";
import { getProjectResources } from "@/app/projects/actions-fetchers";

export default async function CreativityTab({ projectId, currentUser }: { projectId: string, currentUser: any }) {
    const resources = await getProjectResources(projectId);
    return <CreativitiesView projectId={projectId} resources={resources} currentUser={currentUser} />;
}
