# Crear Usuario Administrador

## 🚨 Situación Actual

No hay backups disponibles y no puedes acceder al sistema porque no hay usuarios en la base de datos.

---

## ✅ Solución: Crear Usuario Administrador

### Opción 1: Script Automático (Recomendado)

He creado un script interactivo que te guiará paso a paso:

```bash
# Ejecutar el script
node scripts/create-admin.js
```

El script te pedirá:
1. **Nombre completo** (ej: Nahuel Figueroa)
2. **Email** (ej: tu@email.com)
3. **Contraseña** (mínimo 6 caracteres)

Y creará automáticamente:
- ✅ Usuario en **Supabase Auth** (para login)
- ✅ Usuario en **Base de datos** (para aplicación)
- ✅ Rol **SUPERADMIN** (acceso completo)

---

### Opción 2: Crear desde Supabase Dashboard

Si el script no funciona, puedes hacerlo manualmente:

#### 2.1 Crear en Supabase Auth

1. Ve a: https://app.supabase.com/project/qoimgaewmmoryuyxkwna
2. Navega a **Authentication** → **Users**
3. Click en **"Add user"** → **"Create new user"**
4. Ingresa:
   - Email
   - Password (mínimo 6 caracteres)
   - Auto Confirm Email: ✅ Activado
5. Click en **"Create user"**

#### 2.2 Crear en Base de Datos

Luego necesitas crear el usuario en la base de datos:

1. En Supabase, ve a **SQL Editor**
2. Copia y pega este SQL (reemplaza los valores):

```sql
INSERT INTO "User" (
    id,
    name,
    email,
    role,
    avatar,
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    'TU NOMBRE',                           -- Cambia esto
    'TU@EMAIL.COM',                        -- Cambia esto (debe coincidir con Auth)
    'SUPERADMIN',
    'https://ui-avatars.com/api/?name=TU+NOMBRE&background=6366f1',
    NOW(),
    NOW()
);
```

3. Click en **"Run"**

---

### Opción 3: SQL Directo con PostgreSQL

Si prefieres usar la terminal:

```bash
# Conectar a la base de datos
/opt/homebrew/opt/postgresql@17/bin/psql "$DIRECT_URL"

# Dentro de psql, ejecutar:
INSERT INTO "User" (
    id, name, email, role, avatar, "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'TU NOMBRE',
    'tu@email.com',
    'SUPERADMIN',
    'https://ui-avatars.com/api/?name=TU+NOMBRE&background=6366f1',
    NOW(),
    NOW()
);

# Salir
\q
```

**⚠️ IMPORTANTE**: También necesitas crear el usuario en Supabase Auth (usa Opción 2.1).

---

## Verificación

Después de crear el usuario:

1. Ve a tu aplicación: https://tu-app.vercel.app/login
2. Ingresa tu email y contraseña
3. Deberías poder acceder con acceso de SUPERADMIN

---

## Próximos Pasos (Recuperar Datos)

Una vez que tengas acceso:

1. **Crear clientes manualmente** desde la UI
2. **Importar datos si tienes CSV/Excel** (puedo ayudarte con un script)
3. **Configurar backups regulares**: `./scripts/backup-production.sh`

---

## 🆘 Problemas Comunes

### Error: "Invalid login credentials"
- Verifica que el email coincida exactamente en Auth y DB
- Verifica que el password sea correcto (mínimo 6 caracteres)

### Error: "User already exists"
- El email ya está registrado
- Usa otro email o elimina el usuario existente

### Script no funciona
- Verifica que `.env` tenga las variables correctas
- Asegúrate de ejecutar desde el directorio del proyecto
- Verifica que tengas `@supabase/supabase-js` instalado

Si tienes problemas, házmelo saber y te ayudo a resolverlos.
