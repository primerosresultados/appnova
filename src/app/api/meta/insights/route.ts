import { NextRequest, NextResponse } from 'next/server';
import { getMetaAccessToken } from '@/app/actions/meta-actions';
import { db } from '@/lib/db';

/**
 * Fetch Meta Ads insights for a project's linked ad account
 * Query params:
 * - projectId: ID of the project
 * - days: Number of days to fetch (default: 30)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const projectId = searchParams.get('projectId');
        const days = parseInt(searchParams.get('days') || '30');

        if (!projectId) {
            return NextResponse.json(
                { error: 'projectId is required' },
                { status: 400 }
            );
        }

        // Get project's linked ad account
        const project = await db.project.findUnique({
            where: { id: projectId },
            select: {
                metaAdAccountId: true,
                metaAdAccountName: true,
            },
        });

        if (!project?.metaAdAccountId) {
            return NextResponse.json(
                { error: 'No Meta ad account linked to this project' },
                { status: 404 }
            );
        }

        // Get Meta access token
        const tokenResult = await getMetaAccessToken();
        if (!tokenResult.success || !tokenResult.data) {
            return NextResponse.json(
                { error: 'Meta not connected or token expired' },
                { status: 401 }
            );
        }

        const { accessToken } = tokenResult.data;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Fetch insights from Meta API
        const insightsUrl = new URL(
            `https://graph.facebook.com/v18.0/${project.metaAdAccountId}/insights`
        );
        insightsUrl.searchParams.set('access_token', accessToken);
        insightsUrl.searchParams.set('time_range', JSON.stringify({
            since: startDateStr,
            until: endDateStr,
        }));
        insightsUrl.searchParams.set('fields', [
            'reach',
            'impressions',
            'clicks',
            'spend',
            'actions',
        ].join(','));

        const response = await fetch(insightsUrl.toString());
        const data = await response.json();

        if (!response.ok || data.error) {
            console.error('Error fetching Meta insights:', data.error);
            return NextResponse.json(
                { error: 'Failed to fetch insights from Meta' },
                { status: 500 }
            );
        }

        // Parse and aggregate insights
        const insights = data.data?.[0] || {};

        // Extract conversions from actions array
        let conversions = 0;
        if (insights.actions && Array.isArray(insights.actions)) {
            const conversionActions = insights.actions.filter((action: any) =>
                action.action_type?.includes('conversion') ||
                action.action_type === 'offsite_conversion.fb_pixel_purchase'
            );
            conversions = conversionActions.reduce((sum: number, action: any) =>
                sum + parseInt(action.value || '0'), 0
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                reach: parseInt(insights.reach || '0'),
                impressions: parseInt(insights.impressions || '0'),
                clicks: parseInt(insights.clicks || '0'),
                spend: parseFloat(insights.spend || '0'),
                conversions,
                dateRange: {
                    start: startDateStr,
                    end: endDateStr,
                },
                adAccountName: project.metaAdAccountName,
            },
        });
    } catch (error) {
        console.error('Error fetching Meta Ads insights:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Meta Ads insights' },
            { status: 500 }
        );
    }
}
