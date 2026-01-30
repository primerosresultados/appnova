
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma Client...');

    // 1. Try to fetch a client with the new relations
    // We'll just fetch the first one we find
    const client = await prisma.client.findFirst({
        include: {
            projects: true,
            financialRecords: true,
            clientNotes: true
        }
    });

    console.log('Successfully queried client with new relations!');
    console.log('Client found:', client ? client.name : 'No clients in DB');
}

main()
    .catch(e => {
        console.error('ERROR:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
