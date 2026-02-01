export const dynamic = 'force-dynamic';
import { Suspense } from "react";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function ProjectsListSkeleton() {
    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-[150px] mb-2" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Skeleton className="h-10 w-full md:w-64" />
                    <Skeleton className="h-10 w-[140px]" />
                </div>
            </div>
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-card border-border/50">
                        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                            <Skeleton className="h-6 w-[140px]" />
                            <div className="flex-1 space-y-2 w-full">
                                <Skeleton className="h-5 w-[200px]" />
                                <Skeleton className="h-4 w-[300px]" />
                            </div>
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <Skeleton className="h-1.5 w-24 hidden md:block" />
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={<ProjectsListSkeleton />}>
            <ProjectsList />
        </Suspense>
    );
}
