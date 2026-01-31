"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function getUserSession() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        // Fetch user details from our DB using email
        const dbUser = await db.user.findUnique({
            where: { email: user.email }
        });

        return dbUser;
    } catch (error) {
        console.error("Error getting user session:", error);
        return null;
    }
}
