
import { ProjectDashboardTab } from "@/components/projects/ProjectDashboardTab";
import { getProjectCore, getProjectConversions, getProjectContents, getProjectTasks } from "@/app/projects/actions-fetchers";

export default async function DashboardTab({ projectId }: { projectId: string }) {
    const [project, conversions, contents, tasks] = await Promise.all([
        getProjectCore(projectId),
        getProjectConversions(projectId),
        getProjectContents(projectId),
        getProjectTasks(projectId),
    ]);
    return <ProjectDashboardTab project={project} conversions={conversions} contents={contents} tasks={tasks} />;
}
