
import { AdsTab as AdsView } from "@/components/projects/AdsTab";
import { getProjectAdReports } from "@/app/projects/actions-fetchers";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

// Cache meta account ID lookup — small query but uncached = unnecessary DB hit per render
const getCachedMetaAccountId = unstable_cache(
    async (id: string) => {
        const project = await db.project.findUnique({
            where: { id },
            select: { metaAdAccountId: true }
        });
        return project?.metaAdAccountId;
    },
    ['meta-account-id'],
    { revalidate: 60 }
);

export default async function AdsTab({ projectId, currentUser }: { projectId: string, currentUser: any }) {
    const [adReports, metaAdAccountId] = await Promise.all([
        getProjectAdReports(projectId),
        getCachedMetaAccountId(projectId)
    ]);

    return (
        <AdsView
            projectId={projectId}
            metaAdAccountId={metaAdAccountId ?? null}
            adReports={adReports}
            currentUser={currentUser}
        />
    );
}
