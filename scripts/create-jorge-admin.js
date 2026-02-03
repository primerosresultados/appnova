#!/usr/bin/env node

/**
 * Script para crear usuario administrador Jorge
 */

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

// Credenciales del administrador
const ADMIN = {
    name: 'Jorge',
    email: 'jorge@novaparteners.cl',
    password: 'Sk843ver$'
};

async function main() {
    console.log('\n🔐 CREANDO USUARIO ADMINISTRADOR\n');

    try {
        // 1. Crear en Supabase Auth
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

        console.log('1️⃣ Creando usuario en Supabase Auth...');
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: ADMIN.email,
            email_confirm: true,
            user_metadata: { full_name: ADMIN.name },
            password: ADMIN.password
        });

        if (authError) {
            console.error('❌ Error al crear en Supabase Auth:', authError.message);

            // Si ya existe, continuar
            if (authError.message.includes('already registered')) {
                console.log('⚠️  Usuario ya existe en Auth, continuando...');
            } else {
                process.exit(1);
            }
        } else {
            console.log('   ✅ Usuario creado en Auth con ID:', authUser.user.id);
        }

        // 2. Crear en base de datos Prisma
        console.log('2️⃣ Creando usuario en base de datos...');

        // Verificar si ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email: ADMIN.email }
        });

        if (existingUser) {
            console.log('⚠️  Usuario ya existe en DB, actualizando a SUPERADMIN...');
            await prisma.user.update({
                where: { email: ADMIN.email },
                data: { role: 'SUPERADMIN' }
            });
            console.log('   ✅ Usuario actualizado a SUPERADMIN');
        } else {
            const dbUser = await prisma.user.create({
                data: {
                    name: ADMIN.name,
                    email: ADMIN.email,
                    role: 'SUPERADMIN',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ADMIN.name)}&background=6366f1`
                }
            });
            console.log('   ✅ Usuario creado en DB con ID:', dbUser.id);
        }

        console.log('\n🎉 ¡Usuario administrador creado exitosamente!\n');
        console.log('Credenciales:');
        console.log(`   Email: ${ADMIN.email}`);
        console.log(`   Contraseña: ${ADMIN.password}`);
        console.log(`   Rol: SUPERADMIN`);
        console.log('\n✅ Ahora puedes iniciar sesión en tu aplicación.\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
