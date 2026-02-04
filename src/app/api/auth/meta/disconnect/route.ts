import { NextRequest, NextResponse } from 'next/server';
import { disconnectMeta } from '@/app/actions/meta-actions';

/**
 * Disconnect Meta integration
 * Removes Meta credentials and clears all project linkages
 */
export async function POST(request: NextRequest) {
    try {
        const result = await disconnectMeta();

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error('Error disconnecting Meta:', error);
        return NextResponse.json(
            { error: 'Failed to disconnect Meta' },
            { status: 500 }
        );
    }
}
