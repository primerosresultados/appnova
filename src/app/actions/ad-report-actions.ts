'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Create a new ad campaign report with blocks
 */
export async function createAdReport(data: {
    projectId: string;
    platform: 'META_ADS' | 'GOOGLE_ADS' | 'OTHER';
    startDate: Date;
    endDate: Date;
    title: string;
    reach?: number;
    impressions?: number;
    clicks?: number;
    spend?: number;
    conversions?: number;
    blocks?: {
        title: string;
        description: string;
        images: string[];
        files: { name: string; url: string; size: number; type: string }[];
    }[];
    selectedMetrics?: string[]; // Metric keys like ["reach", "spend", "ctr"]
    createdById?: string;
}) {
    try {
        const report = await db.adReport.create({
            data: {
                projectId: data.projectId,
                platform: data.platform,
                startDate: data.startDate,
                endDate: data.endDate,
                title: data.title,
                reach: data.reach,
                impressions: data.impressions,
                clicks: data.clicks,
                spend: data.spend,
                conversions: data.conversions,
                selectedMetrics: data.selectedMetrics || null,
                createdById: data.createdById,
                blocks: data.blocks && data.blocks.length > 0 ? {
                    create: data.blocks.map((block, index) => ({
                        order: index,
                        title: block.title,
                        description: block.description,
                        images: block.images,
                        files: block.files,
                    })),
                } : undefined,
            },
        });

        revalidatePath(`/projects/${data.projectId}`);

        return {
            success: true,
            data: report,
        };
    } catch (error) {
        console.error('Error creating ad report:', error);
        return {
            success: false,
            error: 'Failed to create ad report',
        };
    }
}

/**
 * Update an existing ad report
 */
export async function updateAdReport(
    reportId: string,
    data: {
        platform?: 'META_ADS' | 'GOOGLE_ADS' | 'OTHER';
        startDate?: Date;
        endDate?: Date;
        title?: string;
        reach?: number;
        impressions?: number;
        clicks?: number;
        spend?: number;
        conversions?: number;
        content?: string;
    }
) {
    try {
        const report = await db.adReport.update({
            where: { id: reportId },
            data,
        });

        // Get project ID for revalidation
        const projectId = report.projectId;
        revalidatePath(`/projects/${projectId}`);

        return {
            success: true,
            data: report,
        };
    } catch (error) {
        console.error('Error updating ad report:', error);
        return {
            success: false,
            error: 'Failed to update ad report',
        };
    }
}

/**
 * Delete an ad report
 */
export async function deleteAdReport(reportId: string, projectId: string) {
    try {
        await db.adReport.delete({
            where: { id: reportId },
        });

        revalidatePath(`/projects/${projectId}`);

        return {
            success: true,
            message: 'Ad report deleted successfully',
        };
    } catch (error) {
        console.error('Error deleting ad report:', error);
        return {
            success: false,
            error: 'Failed to delete ad report',
        };
    }
}

/**
 * Get all ad reports for a project
 */
export async function getProjectAdReports(projectId: string) {
    try {
        const reports = await db.adReport.findMany({
            where: { projectId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        return {
            success: true,
            data: reports,
        };
    } catch (error) {
        console.error('Error fetching ad reports:', error);
        return {
            success: false,
            error: 'Failed to fetch ad reports',
        };
    }
}
