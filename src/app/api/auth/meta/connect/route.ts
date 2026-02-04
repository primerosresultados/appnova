import { NextRequest, NextResponse } from 'next/server';

/**
 * Initiate Meta OAuth flow
 * Redirects user to Meta authorization page
 */
export async function GET(request: NextRequest) {
    try {
        const metaAppId = process.env.META_APP_ID;
        const redirectUri = process.env.META_REDIRECT_URI;

        if (!metaAppId || !redirectUri) {
            return NextResponse.json(
                { error: 'Meta OAuth is not configured. Please add META_APP_ID and META_REDIRECT_URI to .env' },
                { status: 500 }
            );
        }

        // Meta OAuth authorization URL
        const scopes = ['ads_read', 'ads_management'];
        const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
        authUrl.searchParams.set('client_id', metaAppId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('scope', scopes.join(','));
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('state', generateRandomState()); // CSRF protection

        return NextResponse.redirect(authUrl.toString());
    } catch (error) {
        console.error('Error initiating Meta OAuth:', error);
        return NextResponse.json(
            { error: 'Failed to initiate Meta OAuth' },
            { status: 500 }
        );
    }
}

/**
 * Generate random state for CSRF protection
 */
function generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
