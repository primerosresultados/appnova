# Sincronizar Usuarios Auth con Base de Datos

## Problema

Los usuarios existen en **Supabase Auth** pero no en la tabla **User** de la base de datos. Esto ocurrió porque:
- La base de datos se perdió (tabla `User` vacía)
- Supabase Auth es un servicio separado (usuarios aún existen allí)

---

## Solución 1: Sincronizar Usuarios de Auth a DB (Recomendado)

Este script traerá todos los usuarios de Supabase Auth y los creará en la base de datos:

```bash
node scripts/sync-auth-users.js
```

**Qué hace:**
- Lee todos los usuarios de Supabase Auth
- Crea registros en la tabla `User` para cada uno
- Mantiene las credenciales de Auth intactas
- Asigna rol COLABORADOR por defecto (puedes cambiar después)

---

## Solución 2: Limpiar Usuarios de Auth

Si prefieres empezar de cero y eliminar los usuarios viejos de Auth:

### Desde Supabase Dashboard:

1. Ve a: https://app.supabase.com/project/qoimgaewmmoryuyxkwna
2. **Authentication** → **Users**
3. Para cada usuario que quieres eliminar:
   - Click en los 3 puntos (⋯)
   - Click en **"Delete user"**
   - Confirma

### Con Script:

```bash
node scripts/clean-auth-orphans.js
```

Esto eliminará usuarios de Auth que NO están en la base de datos.

---

## Recomendación

**Usa Solución 1** si:
- Quieres recuperar esos usuarios
- Conoces quiénes son esas personas
- Necesitas que puedan acceder de nuevo

**Usa Solución 2** si:
- Eran usuarios de prueba
- No los necesitas
- Prefieres crear usuarios nuevos desde cero

---

## ¿Qué usuarios tienes en Auth?

Según tu screenshot, tienes **7 usuarios** en Supabase Auth. Para ver sus emails:

1. Ve a **Authentication** → **Users** en Supabase
2. Verás la lista con emails

Dime si quieres que cree el script de sincronización o prefieres eliminarlos.
