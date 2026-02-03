#!/usr/bin/env node

/**
 * Script para crear usuario administrador en una base de datos vacía
 * USO: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('\n🔐 CREAR USUARIO ADMINISTRADOR\n');
    console.log('Este script creará un usuario SUPERADMIN en tu base de datos.');
    console.log('Asegúrate de tener las variables SUPABASE_SERVICE_ROLE_KEY configuradas.\n');

    // Solicitar información del usuario
    const name = await question('Nombre completo: ');
    const email = await question('Email: ');
    const password = await question('Contraseña (mínimo 6 caracteres): ');

    if (!name || !email || !password) {
        console.error('\n❌ Error: Todos los campos son requeridos');
        process.exit(1);
    }

    if (password.length < 6) {
        console.error('\n❌ Error: La contraseña debe tener al menos 6 caracteres');
        process.exit(1);
    }

    console.log('\n📝 Creando usuario...\n');

    try {
        // 1. Crear en Supabase Auth
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('❌ Error: Faltan variables de entorno de Supabase');
            console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
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
            email: email,
            email_confirm: true,
            user_metadata: { full_name: name },
            password: password
        });

        if (authError) {
            console.error('❌ Error al crear en Supabase Auth:', authError.message);
            process.exit(1);
        }

        console.log('   ✅ Usuario creado en Auth con ID:', authUser.user.id);

        // 2. Crear en base de datos Prisma
        console.log('2️⃣ Creando usuario en base de datos...');
        const dbUser = await prisma.user.create({
            data: {
                name: name,
                email: email,
                role: 'SUPERADMIN',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1`
            }
        });

        console.log('   ✅ Usuario creado en DB con ID:', dbUser.id);

        console.log('\n🎉 ¡Usuario administrador creado exitosamente!\n');
        console.log('Credenciales:');
        console.log(`   Email: ${email}`);
        console.log(`   Contraseña: ${password}`);
        console.log('\nAhora puedes iniciar sesión en tu aplicación.\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.code === 'P2002') {
            console.error('Este email ya existe en la base de datos.');
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

main().catch(console.error);
