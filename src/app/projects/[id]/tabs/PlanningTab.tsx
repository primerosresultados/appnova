
import { ProjectCalendar } from "@/components/projects/ProjectCalendar";
import { getProjectMilestones, getProjectContents, getProjectTasks } from "@/app/projects/actions-fetchers";

export default async function PlanningTab({ projectId, isClient }: { projectId: string, isClient: boolean }) {
    const [milestones, contents, tasks] = await Promise.all([
        getProjectMilestones(projectId),
        getProjectContents(projectId),
        getProjectTasks(projectId)
    ]);

    return (
        <div className="w-full h-full">
            <ProjectCalendar
                projectId={projectId}
                milestones={milestones}
                contents={contents}
                tasks={tasks}
                isClient={isClient}
            />
        </div>
    );
}
