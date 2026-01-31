import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    const role = process.argv[3];

    if (!email) {
        console.error('Please provide an email address.');
        process.exit(1);
    }

    console.log(`Updating user ${email} to role ${role || 'SUPERADMIN'}...`);

    try {
        // Upsert the user to ensure they exist in our public table
        // This is safe because if they logged in via Supabase, verified email is trustable.
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: (role as any) || 'SUPERADMIN',
            },
            create: {
                email,
                name: email.split('@')[0], // Default name
                role: (role as any) || 'SUPERADMIN',
            },
        });

        console.log('Success! User updated:', user);
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
