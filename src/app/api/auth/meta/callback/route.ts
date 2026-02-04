import { NextRequest, NextResponse } from 'next/server';
import { storeMetaAccessToken } from '@/app/actions/meta-actions';

/**
 * OAuth callback handler
 * Receives authorization code from Meta and exchanges it for access token
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // Handle errors from Meta
        if (error) {
            console.error('Meta OAuth error:', error);
            return NextResponse.redirect(
                new URL('/settings?meta_error=' + encodeURIComponent(error), request.url)
            );
        }

        // Validate authorization code
        if (!code) {
            return NextResponse.redirect(
                new URL('/settings?meta_error=no_code', request.url)
            );
        }

        const metaAppId = process.env.META_APP_ID;
        const metaAppSecret = process.env.META_APP_SECRET;
        const redirectUri = process.env.META_REDIRECT_URI;

        if (!metaAppId || !metaAppSecret || !redirectUri) {
            return NextResponse.redirect(
                new URL('/settings?meta_error=config_missing', request.url)
            );
        }

        // Exchange authorization code for access token
        const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
        tokenUrl.searchParams.set('client_id', metaAppId);
        tokenUrl.searchParams.set('client_secret', metaAppSecret);
        tokenUrl.searchParams.set('redirect_uri', redirectUri);
        tokenUrl.searchParams.set('code', code);

        const tokenResponse = await fetch(tokenUrl.toString());
        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || tokenData.error) {
            console.error('Error exchanging code for token:', tokenData);
            return NextResponse.redirect(
                new URL('/settings?meta_error=token_exchange_failed', request.url)
            );
        }

        const { access_token, expires_in } = tokenData;

        // Exchange short-lived token for long-lived token (optional but recommended)
        const longLivedTokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
        longLivedTokenUrl.searchParams.set('grant_type', 'fb_exchange_token');
        longLivedTokenUrl.searchParams.set('client_id', metaAppId);
        longLivedTokenUrl.searchParams.set('client_secret', metaAppSecret);
        longLivedTokenUrl.searchParams.set('fb_exchange_token', access_token);

        const longLivedResponse = await fetch(longLivedTokenUrl.toString());
        const longLivedData = await longLivedResponse.json();

        const finalToken = longLivedData.access_token || access_token;
        const finalExpiresIn = longLivedData.expires_in || expires_in || 5184000; // Default 60 days

        // Store access token in database
        const result = await storeMetaAccessToken(finalToken, finalExpiresIn);

        if (!result.success) {
            return NextResponse.redirect(
                new URL('/settings?meta_error=storage_failed', request.url)
            );
        }

        // Redirect back to settings with success message
        return NextResponse.redirect(
            new URL('/settings?meta_success=true&tab=connections', request.url)
        );
    } catch (error) {
        console.error('Error in Meta OAuth callback:', error);
        return NextResponse.redirect(
            new URL('/settings?meta_error=callback_failed', request.url)
        );
    }
}
