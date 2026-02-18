import { getProspects } from "./actions";
import { ProspectosClient } from "@/components/prospectos/ProspectosClient";
import { getOrganizationSettings } from "@/app/actions/organization-actions";

export const dynamic = "force-dynamic";

export default async function ProspectosPage() {
    const [prospects, orgResult] = await Promise.all([
        getProspects(),
        getOrganizationSettings()
    ]);

    const org = orgResult.success ? orgResult.data : null;

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <ProspectosClient initialProspects={prospects} organization={org} />
        </div>
    );
}
