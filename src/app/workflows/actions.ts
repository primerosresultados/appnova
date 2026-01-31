"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createWorkflow(data: {
    name: string;
    description?: string;
    category?: string;
    stages: {
        title: string;
        description?: string;
        order: number;
        tasks: {
            title: string;
            description?: string;
            order: number;
        }[];
    }[];
}) {
    try {
        const workflow = await db.workflow.create({
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                stages: {
                    create: data.stages.map(stage => ({
                        title: stage.title,
                        description: stage.description,
                        order: stage.order,
                        tasks: {
                            create: stage.tasks.map(task => ({
                                title: task.title,
                                description: task.description,
                                order: task.order,
                            }))
                        }
                    }))
                }
            }
        });

        revalidatePath("/workflows");
        return { success: true, workflow };
    } catch (error) {
        console.error("Failed to create workflow:", error);
        return { success: false, error: "Failed to create workflow" };
    }
}

export async function updateWorkflow(id: string, data: {
    name: string;
    description?: string;
    category?: string;
    stages: {
        id?: string;
        title: string;
        description?: string;
        order: number;
        tasks: {
            id?: string;
            title: string;
            description?: string;
            order: number;
        }[];
    }[];
}) {
    try {
        // Simple approach: Delete existing stages and tasks and recreate them
        // or a more complex sync. For a template system, recreate is often safer if history isn't critical.
        // However, Prisma can handle nested updates if IDs are provided.

        await db.$transaction(async (tx) => {
            // Update workflow metadata
            await tx.workflow.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    category: data.category,
                }
            });

            // Delete existing stages (this will cascade to tasks)
            await tx.workflowStage.deleteMany({
                where: { workflowId: id }
            });

            // Recreate stages and tasks
            for (const stage of data.stages) {
                await tx.workflowStage.create({
                    data: {
                        workflowId: id,
                        title: stage.title,
                        description: stage.description,
                        order: stage.order,
                        tasks: {
                            create: stage.tasks.map(task => ({
                                title: task.title,
                                description: task.description,
                                order: task.order,
                            }))
                        }
                    }
                });
            }
        });

        revalidatePath("/workflows");
        return { success: true };
    } catch (error) {
        console.error("Failed to update workflow:", error);
        return { success: false, error: "Failed to update workflow" };
    }
}

export async function deleteWorkflow(id: string) {
    console.log("Attempting to delete workflow:", id);
    try {
        await db.workflow.delete({
            where: { id }
        });
        console.log("Workflow deleted successfully");
        revalidatePath("/workflows");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete workflow:", error);
        return { success: false, error: "Failed to delete workflow" };
    }
}

export async function getWorkflows() {
    try {
        const workflows = await db.workflow.findMany({
            include: {
                stages: {
                    include: {
                        tasks: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return workflows;
    } catch (error) {
        console.error("Failed to fetch workflows:", error);
        return [];
    }
}
