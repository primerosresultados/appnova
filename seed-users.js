
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = [
        { name: 'Lucas Martinez', email: 'lucas@novaap.com', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Lucas+Martinez&background=0D8ABC&color=fff' },
        { name: 'Sofia Rodriguez', email: 'sofia@novaap.com', role: 'MEMBER', avatar: 'https://ui-avatars.com/api/?name=Sofia+Rodriguez&background=EPG829&color=fff' },
        { name: 'Mateo Fernandez', email: 'mateo@novaap.com', role: 'MEMBER', avatar: 'https://ui-avatars.com/api/?name=Mateo+Fernandez&background=23C02E&color=fff' },
    ];

    for (const u of users) {
        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (!existing) {
            await prisma.user.create({ data: u });
            console.log(`Created user: ${u.name}`);
        } else {
            console.log(`User already exists: ${u.name}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
