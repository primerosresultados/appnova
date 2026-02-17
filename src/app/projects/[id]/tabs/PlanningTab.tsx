
import { ProjectCalendar } from "@/components/projects/ProjectCalendar";
import { getProjectMilestones, getProjectContents, getProjectTasks } from "@/app/projects/actions-fetchers";
import { getUsers } from "@/app/actions/user-actions";

export default async function PlanningTab({ projectId, isClient }: { projectId: string, isClient: boolean }) {
    const [milestones, contents, tasks, users] = await Promise.all([
        getProjectMilestones(projectId),
        getProjectContents(projectId),
        getProjectTasks(projectId),
        getUsers()
    ]);

    return (
        <div className="w-full h-full">
            <ProjectCalendar
                projectId={projectId}
                milestones={milestones}
                contents={contents}
                tasks={tasks}
                users={users}
                isClient={isClient}
            />
        </div>
    );
}
