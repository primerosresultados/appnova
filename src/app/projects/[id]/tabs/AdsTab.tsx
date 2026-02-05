
import { AdsTab as AdsView } from "@/components/projects/AdsTab";
import { getProjectAdReports } from "@/app/projects/actions-fetchers";
import { db } from "@/lib/db";

// We need metaAdAccountId which is on the project core, but if we fetch just adReports here 
// we might need to pass metaAdAccountId from parent or fetch it again. 
// Fetching just the ID is cheap.
async function getMetaAccountId(id: string) {
    const project = await db.project.findUnique({
        where: { id },
        select: { metaAdAccountId: true }
    });
    return project?.metaAdAccountId;
}

export default async function AdsTab({ projectId, currentUser }: { projectId: string, currentUser: any }) {
    const [adReports, metaAdAccountId] = await Promise.all([
        getProjectAdReports(projectId),
        getMetaAccountId(projectId)
    ]);

    return (
        <AdsView
            projectId={projectId}
            metaAdAccountId={metaAdAccountId}
            adReports={adReports}
            currentUser={currentUser}
        />
    );
}
