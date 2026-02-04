'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getUserSession } from './auth-actions';

/**
 * Toggle reaction (like/dislike) on an ActionLog entry
 */
export async function toggleActionLogReaction(actionLogId: string, type: 'LIKE' | 'DISLIKE') {
    try {
        const user = await getUserSession();
        if (!user) {
            return { success: false, message: 'Unauthorized' };
        }

        // Find existing reaction
        const existingReaction = await db.actionLogReaction.findUnique({
            where: {
                actionLogId_userId: {
                    actionLogId,
                    userId: user.id
                }
            }
        });

        if (existingReaction) {
            // If same type, remove reaction (toggle off)
            if (existingReaction.type === type) {
                await db.actionLogReaction.delete({
                    where: { id: existingReaction.id }
                });
                return { success: true, action: 'removed' };
            } else {
                // Change reaction type
                await db.actionLogReaction.update({
                    where: { id: existingReaction.id },
                    data: { type }
                });
                return { success: true, action: 'updated', type };
            }
        } else {
            // Create new reaction
            await db.actionLogReaction.create({
                data: {
                    actionLogId,
                    userId: user.id,
                    type
                }
            });

            // TODO: Create notification for log owner (if not self)

            return { success: true, action: 'created', type };
        }
    } catch (error) {
        console.error('Toggle reaction error:', error);
        return { success: false, message: 'Failed to toggle reaction' };
    }
}

/**
 * Get reaction counts and user's reaction for an ActionLog
 */
export async function getActionLogReactions(actionLogId: string) {
    try {
        const user = await getUserSession();

        const reactions = await db.actionLogReaction.findMany({
            where: { actionLogId },
            include: {
                user: {
                    select: { id: true, name: true }
                }
            }
        });

        const likes = reactions.filter(r => r.type === 'LIKE').length;
        const dislikes = reactions.filter(r => r.type === 'DISLIKE').length;
        const userReaction = user ? reactions.find(r => r.userId === user.id)?.type : null;

        return {
            success: true,
            data: { likes, dislikes, userReaction, reactions }
        };
    } catch (error) {
        console.error('Get reactions error:', error);
        return { success: false, message: 'Failed to get reactions' };
    }
}

/**
 * Create a notification
 */
export async function createNotification(data: {
    userId: string;
    type: 'MENTION' | 'REPLY' | 'REACTION';
    title: string;
    message: string;
    actionLogId?: string;
}) {
    try {
        await db.notification.create({
            data
        });
        return { success: true };
    } catch (error) {
        console.error('Create notification error:', error);
        return { success: false };
    }
}

/**
 * Get unread notifications for current user
 */
export async function getUnreadNotifications() {
    try {
        const user = await getUserSession();
        if (!user) return { success: false, data: [] };

        const notifications = await db.notification.findMany({
            where: {
                userId: user.id,
                read: false
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return { success: true, data: notifications };
    } catch (error) {
        console.error('Get notifications error:', error);
        return { success: false, data: [] };
    }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
    try {
        await db.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
        return { success: true };
    } catch (error) {
        console.error('Mark notification read error:', error);
        return { success: false };
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
    try {
        const user = await getUserSession();
        if (!user) return { success: false };

        await db.notification.updateMany({
            where: {
                userId: user.id,
                read: false
            },
            data: { read: true }
        });

        return { success: true };
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        return { success: false };
    }
}
