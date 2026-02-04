import { NextRequest, NextResponse } from 'next/server';
import { getMetaAccessToken } from '@/app/actions/meta-actions';

/**
 * Fetch available Meta ad accounts
 * Returns list of ad accounts the user has access to
 */
export async function GET(request: NextRequest) {
    try {
        // Get access token from database
        const tokenResult = await getMetaAccessToken();

        if (!tokenResult.success || !tokenResult.data) {
            return NextResponse.json(
                { error: tokenResult.error || 'Meta not connected' },
                { status: 401 }
            );
        }

        const { accessToken } = tokenResult.data;

        // Fetch user's ad accounts from Meta API
        const meUrl = new URL('https://graph.facebook.com/v18.0/me');
        meUrl.searchParams.set('fields', 'adaccounts{id,name,account_status}');
        meUrl.searchParams.set('access_token', accessToken);

        const response = await fetch(meUrl.toString());
        const data = await response.json();

        if (!response.ok || data.error) {
            console.error('Error fetching ad accounts:', data.error);
            return NextResponse.json(
                { error: 'Failed to fetch ad accounts from Meta' },
                { status: 500 }
            );
        }

        // Extract and format ad accounts
        const adAccounts = data.adaccounts?.data || [];
        const formattedAccounts = adAccounts
            .filter((account: any) => account.account_status === 1) // Only active accounts
            .map((account: any) => ({
                id: account.id,
                name: account.name,
            }));

        return NextResponse.json({
            success: true,
            data: formattedAccounts,
        });
    } catch (error) {
        console.error('Error fetching Meta ad accounts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ad accounts' },
            { status: 500 }
        );
    }
}
