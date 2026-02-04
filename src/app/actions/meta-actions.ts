'use server';

import { db } from '@/lib/db';

/**
 * Get Meta connection status for the organization
 */
export async function getMetaConnectionStatus() {
    try {
        const org = await db.organization.findUnique({
            where: { id: 'default' },
            select: {
                metaAccessToken: true,
                metaTokenExpiry: true,
                metaConnectedAt: true,
            },
        });

        if (!org || !org.metaAccessToken) {
            return {
                success: true,
                data: {
                    connected: false,
                    connectedAt: null,
                    tokenExpiry: null,
                },
            };
        }

        // Check if token is expired
        const isExpired = org.metaTokenExpiry && new Date(org.metaTokenExpiry) < new Date();

        return {
            success: true,
            data: {
                connected: !isExpired,
                connectedAt: org.metaConnectedAt,
                tokenExpiry: org.metaTokenExpiry,
                isExpired,
            },
        };
    } catch (error) {
        console.error('Error getting Meta connection status:', error);
        return {
            success: false,
            error: 'Failed to get Meta connection status',
        };
    }
}

/**
 * Link a project to a Meta ad account
 */
export async function linkProjectToAdAccount(
    projectId: string,
    adAccountId: string,
    adAccountName: string
) {
    try {
        await db.project.update({
            where: { id: projectId },
            data: {
                metaAdAccountId: adAccountId,
                metaAdAccountName: adAccountName,
            },
        });

        return {
            success: true,
            message: 'Project linked to ad account successfully',
        };
    } catch (error) {
        console.error('Error linking project to ad account:', error);
        return {
            success: false,
            error: 'Failed to link project to ad account',
        };
    }
}

/**
 * Unlink a project from its Meta ad account
 */
export async function unlinkProjectFromAdAccount(projectId: string) {
    try {
        await db.project.update({
            where: { id: projectId },
            data: {
                metaAdAccountId: null,
                metaAdAccountName: null,
            },
        });

        return {
            success: true,
            message: 'Project unlinked from ad account',
        };
    } catch (error) {
        console.error('Error unlinking project from ad account:', error);
        return {
            success: false,
            error: 'Failed to unlink project from ad account',
        };
    }
}

/**
 * Get the Meta ad account linked to a project
 */
export async function getProjectAdAccount(projectId: string) {
    try {
        const project = await db.project.findUnique({
            where: { id: projectId },
            select: {
                metaAdAccountId: true,
                metaAdAccountName: true,
            },
        });

        return {
            success: true,
            data: {
                adAccountId: project?.metaAdAccountId || null,
                adAccountName: project?.metaAdAccountName || null,
            },
        };
    } catch (error) {
        console.error('Error getting project ad account:', error);
        return {
            success: false,
            error: 'Failed to get project ad account',
        };
    }
}

/**
 * Store Meta access token (internal use only - called by OAuth callback)
 */
export async function storeMetaAccessToken(
    accessToken: string,
    expiresIn: number
) {
    try {
        const tokenExpiry = new Date();
        tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expiresIn);

        await db.organization.update({
            where: { id: 'default' },
            data: {
                metaAccessToken: accessToken,
                metaTokenExpiry: tokenExpiry,
                metaConnectedAt: new Date(),
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error storing Meta access token:', error);
        return {
            success: false,
            error: 'Failed to store access token',
        };
    }
}

/**
 * Disconnect Meta integration
 */
export async function disconnectMeta() {
    try {
        // Clear Meta credentials
        await db.organization.update({
            where: { id: 'default' },
            data: {
                metaAccessToken: null,
                metaTokenExpiry: null,
                metaConnectedAt: null,
            },
        });

        // Clear all project ad account linkages
        await db.project.updateMany({
            where: {
                metaAdAccountId: { not: null },
            },
            data: {
                metaAdAccountId: null,
                metaAdAccountName: null,
            },
        });

        return {
            success: true,
            message: 'Meta integration disconnected successfully',
        };
    } catch (error) {
        console.error('Error disconnecting Meta:', error);
        return {
            success: false,
            error: 'Failed to disconnect Meta',
        };
    }
}

/**
 * Get Meta access token (internal use only)
 */
export async function getMetaAccessToken() {
    try {
        const org = await db.organization.findUnique({
            where: { id: 'default' },
            select: {
                metaAccessToken: true,
                metaTokenExpiry: true,
            },
        });

        if (!org?.metaAccessToken) {
            return { success: false, error: 'Meta not connected' };
        }

        // Check if token is expired
        if (org.metaTokenExpiry && new Date(org.metaTokenExpiry) < new Date()) {
            return { success: false, error: 'Token expired' };
        }

        return {
            success: true,
            data: { accessToken: org.metaAccessToken },
        };
    } catch (error) {
        console.error('Error getting Meta access token:', error);
        return {
            success: false,
            error: 'Failed to get access token',
        };
    }
}
