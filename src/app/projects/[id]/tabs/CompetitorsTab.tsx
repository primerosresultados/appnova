
import { CompetitorsTab as CompetitorsView } from "@/components/projects/CompetitorsTab";
import { getProjectCompetitors } from "@/app/projects/actions-fetchers";

export default async function CompetitorsTab({ projectId }: { projectId: string }) {
    const competitors = await getProjectCompetitors(projectId);
    return <CompetitorsView projectId={projectId} competitors={competitors} />;
}
