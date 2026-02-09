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
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user || !user.email) {
            return null;
        }

        // Use cross-request cached user lookup
        const dbUser = await getCachedUser(user.email);

        return dbUser;
    } catch (error) {
        console.error("Error getting user session:", error);
        return null;
    }
});
