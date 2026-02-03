#!/usr/bin/env node

/**
 * Script para sincronizar usuarios de Supabase Auth a la base de datos
 * USO: node scripts/sync-auth-users.js
 */

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

async function main() {
    console.log('\n🔄 SINCRONIZANDO USUARIOS DE AUTH A BASE DE DATOS\n');

    try {
        // 1. Conectar a Supabase Admin
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('❌ Error: Faltan variables de entorno de Supabase');
            process.exit(1);
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 2. Obtener todos los usuarios de Auth
        console.log('1️⃣ Obteniendo usuarios de Supabase Auth...');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

        if (authError) {
            console.error('❌ Error al obtener usuarios de Auth:', authError.message);
            process.exit(1);
        }

        const authUsers = authData.users;
        console.log(`   ✅ Encontrados ${authUsers.length} usuarios en Auth`);

        // 3. Obtener usuarios existentes en DB
        console.log('\n2️⃣ Verificando usuarios existentes en DB...');
        const dbUsers = await prisma.user.findMany({
            select: { email: true }
        });
        const existingEmails = new Set(dbUsers.map(u => u.email));
        console.log(`   ✅ ${dbUsers.length} usuarios ya en DB`);

        // 4. Sincronizar usuarios
        console.log('\n3️⃣ Sincronizando usuarios...\n');
        let created = 0;
        let skipped = 0;

        for (const authUser of authUsers) {
            const email = authUser.email;
            const name = authUser.user_metadata?.full_name || email.split('@')[0];

            if (existingEmails.has(email)) {
                console.log(`   ⏭️  ${email} - Ya existe`);
                skipped++;
                continue;
            }

            try {
                await prisma.user.create({
                    data: {
                        name: name,
                        email: email,
                        role: 'COLABORADOR', // Rol por defecto, puedes cambiar después
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                    }
                });
                console.log(`   ✅ ${email} - Creado`);
                created++;
            } catch (error) {
                console.error(`   ❌ ${email} - Error: ${error.message}`);
            }
        }

        console.log('\n🎉 Sincronización completada!\n');
        console.log(`   Usuarios creados: ${created}`);
        console.log(`   Usuarios ya existentes: ${skipped}`);
        console.log(`   Total en Auth: ${authUsers.length}`);
        console.log('\n💡 Los usuarios pueden iniciar sesión con sus credenciales anteriores.');
        console.log('   Puedes cambiar roles desde Configuración → Miembros\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
