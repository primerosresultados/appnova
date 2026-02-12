"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { cache } from "react";
import { unstable_cache } from "next/cache";

// Cross-request cache: user lookup by email cached for 5 minutes
const getCachedUser = unstable_cache(
    async (email: string) => {
        return db.user.findUnique({
            where: { email }
        });
    },
    ['user-session'],
    { revalidate: 300 }
);

// Request-level dedup: no matter how many components call getUserSession()
// during a single server render, it only executes once per request
export const getUserSession = cache(async () => {
    try {
        const supabase = await createClient();

        // Temporarily suppress console.error during getUser() to prevent
        // Supabase's internal AuthApiError logging from appearing in the
        // Next.js dev overlay when the refresh token is expired/missing.
        const originalConsoleError = console.error;
        console.error = (...args: any[]) => {
            const fullMsg = args.map(a => (a instanceof Error ? a.message : String(a))).join(' ');
            if (fullMsg.includes('AuthApiError') || fullMsg.includes('Refresh Token')) return;
            originalConsoleError.apply(console, args);
        };

        const { data: { user }, error } = await supabase.auth.getUser();

        // Restore console.error immediately
        console.error = originalConsoleError;

        if (error || !user || !user.email) {
            return null;
        }

        // Use cross-request cached user lookup
        const dbUser = await getCachedUser(user.email);

        return dbUser;
    } catch (error) {
        // Expected when not logged in — don't log to avoid dev overlay noise
        return null;
    }
});
