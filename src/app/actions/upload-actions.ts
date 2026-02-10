"use server";

import { createClient } from "@supabase/supabase-js";

// Use the SERVICE ROLE key for server-side uploads to bypass Storage RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to 'uploads' bucket in Supabase
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

        const { data, error } = await supabaseAdmin.storage
            .from('uploads')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error("Supabase storage error:", error);
            // Fallback information if needed
            return { success: false, error: "Upload failed: " + error.message + " (Check if 'uploads' bucket exists)" };
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('uploads')
            .getPublicUrl(filename);

        return { success: true, url: publicUrl, name: file.name };
    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Failed to upload file" };
    }
}
