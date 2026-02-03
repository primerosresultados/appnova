# 🚑 Guía de Recuperación de Datos Paso a Paso

## ✅ Estado Actual: Protecciones Implementadas

- Script de seed protegido contra ejecución en producción
- Backup actual creado: `backup_20260203_173138.sql` (320K)
- Scripts de backup/restore listos con PostgreSQL 17

---

## Paso 1: Verificar Backups en Supabase (CRÍTICO)

### Acceder al Dashboard

1. Ve a: **https://app.supabase.com/project/qoimgaewmmoryuyxkwna**
2. Inicia sesión con tu cuenta de Supabase
3. Navega a **Database** → **Backups** en el sidebar izquierdo

### ¿Qué Buscar?

- **Fechas importantes**: 2 de febrero o 3 de febrero (ANTES de las 02:49 AM)
- **Tipo de backup**: 
  - Daily backups (si tienes plan Pro)
  - Point-in-Time Recovery (PITR)

### Escenario A: SÍ HAY BACKUPS ✅

Si encuentras backups anteriores a la pérdida de datos:

#### Opción 1: Point-in-Time Recovery (Recomendado)

1. Haz clic en **"Restore"** o **"Point in Time Recovery"**
2. Selecciona la fecha/hora **ANTES** de la pérdida (ej: 3 de febrero, 00:00 AM)
3. Confirma la restauración
4. **⚠️ ADVERTENCIA**: Esto sobrescribirá todos los datos actuales
5. Espera a que complete (puede tomar varios minutos)

#### Opción 2: Restaurar Backup Completo

1. Encuentra el backup más reciente antes de la pérdida
2. Haz clic en **"Restore"** junto al backup
3. Confirma la operación
4. Espera a que complete

### Escenario B: NO HAY BACKUPS ❌

Si Supabase muestra:
- "No backups available"
- Solo backups después de la pérdida
- Plan Free (sin backups automáticos)

Entonces necesitarás **recuperación manual** (ver Paso 3).

---

## Paso 2: Verificar Recuperación

Después de restaurar desde Supabase:

```bash
# Opcional: Crear un backup post-restauración
./scripts/backup-production.sh
```

1. Abre tu aplicación: https://tu-app.vercel.app
2. Ve a la sección de **Clientes**
3. Verifica que tus datos reales estén presentes
4. Revisa **Proyectos**, **Tareas**, **Finanzas**, etc.

✅ Si todo está correcto: **¡Recuperación exitosa!**

❌ Si siguen faltando datos: Continúa al Paso 3

---

## Paso 3: Recuperación Manual (Si NO hay backups)

### 3.1 Preparación

Desafortunadamente, si no hay backups en Supabase, necesitarás:

1. **Reingreso manual de datos**:
   - Clientes
   - Proyectos
   - Contratos
   - Transacciones financieras
   - Usuarios

2. **Fuentes de información**:
   - ¿Tienes hojas de cálculo con datos?
   - ¿Correos con información de clientes?
   - ¿Facturas o documentos con contratos?
   - ¿Alguna base de datos local o backup personal?

### 3.2 Importación por Lotes

Si tienes datos en CSV o Excel, puedo ayudarte a crear un script de importación:

```typescript
// Ejemplo: importar clientes desde CSV
import { prisma } from '@/lib/db';
import fs from 'fs';

const clientes = JSON.parse(fs.readFileSync('clientes.json', 'utf8'));

for (const cliente of clientes) {
  await prisma.client.create({
    data: {
      name: cliente.nombre,
      industry: cliente.industria,
      email: cliente.email,
      // ... más campos
    }
  });
}
```

---

## Paso 4: Prevención Futura

### A. Activar Plan Pro de Supabase (Recomendado)

**Costo**: ~$25 USD/mes

**Beneficios**:
- Backups diarios automáticos
- Point-in-Time Recovery (hasta 7 días)
- Mayor performance
- Soporte prioritario

**Cómo activar**:
1. Dashboard de Supabase → **Settings** → **Billing**
2. Click en **Upgrade to Pro**
3. Configurar método de pago

### B. Backups Manuales Regulares

Mientras consideras el plan Pro, ejecuta backups manuales:

```bash
# Cada viernes:
./scripts/backup-production.sh

# Los backups se guardan en ./backups/
# Súbelos a Google Drive o similar
```

### C. Script de Backup Automatizado (Opcional)

Puedes configurar un cron job en tu Mac:

```bash
# Editar crontab
crontab -e

# Agregar (backup cada domingo a las 3 AM):
0 3 * * 0 cd /Users/jnahuelfil/dev/novaap && ./scripts/backup-production.sh
```

---

## 🆘 ¿Necesitas Ayuda?

- **Error en scripts**: Revisa [`docs/backup-guide.md`](file:///Users/jnahuelfil/dev/novaap/docs/backup-guide.md)
- **Problemas de conexión**: Verifica variables en `.env`
- **Importación de datos**: Pregúntame y te ayudo a crear scripts

---

## 📋 Comandos Rápidos

```bash
# Crear backup ahora
./scripts/backup-production.sh

# Ver backups disponibles
ls -lh backups/

# Restaurar un backup (¡CUIDADO!)
./scripts/restore-backup.sh backups/backup_20260203_173138.sql
```

**⚠️ CRÍTICO**: Siempre crea un backup del estado actual ANTES de restaurar otro backup.
