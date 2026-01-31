export const dynamic = 'force-dynamic';
import { Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { NewProjectSheet } from "@/components/projects/NewProjectSheet";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function ProjectsListSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card/50 border-border/50">
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
    )
}

export default function ProjectsPage() {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-muted-foreground">Gestiona y rastrea el progreso de todos los proyectos.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar proyectos..."
                            className="pl-9"
                        />
                    </div>
                    <NewProjectSheet />
                </div>
            </div>

            <Suspense fallback={<ProjectsListSkeleton />}>
                <ProjectsList />
            </Suspense>
        </div>
    );
}

