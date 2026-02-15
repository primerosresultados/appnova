import { getProspects } from "./actions";
import { ProspectosClient } from "@/components/prospectos/ProspectosClient";

export const dynamic = "force-dynamic";

export default async function ProspectosPage() {
    const prospects = await getProspects();

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <ProspectosClient initialProspects={prospects} />
        </div>
    );
}
