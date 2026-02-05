
import { ContentsTab as ContentsView } from "@/components/projects/ContentsTab";
import { getProjectContents } from "@/app/projects/actions-fetchers";

export default async function ContentTab({ projectId, isClient }: { projectId: string, isClient: boolean }) {
    const contents = await getProjectContents(projectId);
    return <ContentsView projectId={projectId} contents={contents} isClient={isClient} />;
}
