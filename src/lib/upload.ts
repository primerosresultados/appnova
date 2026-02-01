import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadFile(file: File): Promise<string | null> {
    if (!file || file.size === 0) return null;

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, ""); // Sanitize
        const filename = `${uniqueSuffix}-${originalName}`;

        // Save to public/uploads directory (ensure this exists creation logic or manual)
        // For simplicity, assuming public/uploads exists or using just public for now. 
        // better: public/uploads
        const uploadDir = join(process.cwd(), "public", "uploads");
        const path = join(uploadDir, filename);

        await mkdir(uploadDir, { recursive: true });
        await writeFile(path, buffer);

        return `/uploads/${filename}`;
    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
}
