const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 🚨 PROTECCIÓN: No ejecutar seed en producción
    const dbUrl = process.env.DATABASE_URL || '';

    if (dbUrl.includes('supabase.co') || dbUrl.includes('pooler.supabase')) {
        console.error('');
        console.error('❌ ERROR: SEED BLOQUEADO EN PRODUCCIÓN');
        console.error('');
        console.error('El script de seed solo debe ejecutarse en desarrollo local.');
        console.error('Para ejecutar en producción, elimina esta validación CON EXTREMO CUIDADO.');
        console.error('');
        process.exit(1);
    }

    console.log('Seeding data...');

    // 1. Ensure a user exists
    const user = await prisma.user.upsert({
        where: { email: 'john@nova-partners.com' },
        update: {},
        create: {
            name: 'John Doe',
            email: 'john@nova-partners.com',
            role: 'SUPERADMIN',
        },
    });

    // 2. Ensure a client exists (usando upsert para no duplicar)
    const client = await prisma.client.upsert({
        where: { id: 'seed-client-techflow' },
        update: {},
        create: {
            id: 'seed-client-techflow',
            name: 'TechFlow Solutions',
            industry: 'Software',
            status: 'ACTIVE',
        },
    });

    // 3. Ensure a project exists (usando upsert para no duplicar)
    const project = await prisma.project.upsert({
        where: { id: 'seed-project-q1-2026' },
        update: {},
        create: {
            id: 'seed-project-q1-2026',
            name: 'Campaña Q1 2026',
            description: 'Campaña integral de marketing y SEO.',
            clientId: client.id,
            status: 'IN_PROGRESS',
            priority: 'HIGH',
        },
    });

    // 4. Create some Content
    await prisma.content.createMany({
        data: [
            {
                title: 'Post IG: Lanzamiento Web',
                type: 'INSTAGRAM_POST',
                status: 'APPROVED',
                description: 'Post visual con carrusel sobre la nueva web.',
                projectId: project.id,
                publishDate: new Date('2026-02-10'),
                mediaUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000',
            },
            {
                title: 'Reel: Detrás de cámaras',
                type: 'INSTAGRAM_REEL',
                status: 'DRAFT',
                description: 'Video rapido del equipo trabajando.',
                projectId: project.id,
                publishDate: new Date('2026-02-15'),
            },
            {
                title: 'Articulo SEO: Tendencias 2026',
                type: 'SEO',
                status: 'SCHEDULED',
                description: 'Blog post de 1500 palabras.',
                projectId: project.id,
                publishDate: new Date('2026-02-20'),
                links: 'https://docs.google.com/document/d/123',
            }
        ],
    });

    // 5. Create a Workflow Template
    const workflow = await prisma.workflow.create({
        data: {
            name: 'Onboarding de Marketing',
            description: 'Pasos iniciales para nuevos proyectos de marketing.',
            category: 'Marketing',
            stages: {
                create: [
                    {
                        title: 'Investigación',
                        order: 1,
                        description: 'Entender el mercado y competencia.',
                        tasks: {
                            create: [
                                { title: 'Análisis de competencia', order: 1 },
                                { title: 'Keyword Research', order: 2 }
                            ]
                        }
                    },
                    {
                        title: 'Ejecución Inicial',
                        order: 2,
                        description: 'Primeros entregables.',
                        tasks: {
                            create: [
                                { title: 'Set up de cuentas social media', order: 1 },
                                { title: 'Auditoría Técnica SEO', order: 2 }
                            ]
                        }
                    }
                ]
            }
        },
    });

    // 6. Apply workflow to project
    await prisma.projectWorkflow.create({
        data: {
            projectId: project.id,
            workflowId: workflow.id,
            status: 'ACTIVE',
        }
    });

    // 7. Add some Transactions for Dashboard - REMOVED per user request for real data entry
    /*
    const account = await prisma.account.create({
        data: {
            name: 'Banco Nova',
            type: 'BANK',
            balance: 1500000,
        }
    });

    await prisma.transaction.createMany({
        data: [
            {
                amount: 350000,
                type: 'INCOME',
                category: 'Marketing Services',
                accountId: account.id,
                clientId: client.id,
                projectId: project.id,
                description: 'Primer pago campaña Q1',
            },
            {
                amount: 150000,
                type: 'INCOME',
                category: 'Consulting',
                accountId: account.id,
                clientId: client.id,
                description: 'Asesoría estratégica',
            }
        ]
    });
    */

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
