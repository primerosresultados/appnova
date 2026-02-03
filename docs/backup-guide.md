# Configuración de Backups

## Backups Automáticos (Supabase)

1. Ingresa a tu proyecto: https://app.supabase.com/project/qoimgaewmmoryuyxkwna
2. Ve a **Settings** → **Billing**
3. Verifica si tienes el plan **Pro** (necesario para backups automáticos)
4. Si no lo tienes, considera actualizar para acceder a:
   - Backups diarios automáticos
   - Point-in-Time Recovery (restaurar a cualquier momento)
   - Retención de 7 días

## Backups Manuales

He creado el script [`backup-production.sh`](file:///Users/jnahuelfil/dev/novaap/scripts/backup-production.sh) para backups manuales:

### Crear un Backup

```bash
./scripts/backup-production.sh
```

Esto creará un archivo `.sql` en `./backups/` con timestamp.

### Restaurar un Backup

```bash
# Listar backups disponibles
ls -lh backups/

# Restaurar un backup específico
psql "$DIRECT_URL" < backups/backup_20260203_143000.sql
```

> ⚠️ **IMPORTANTE**: Antes de restaurar, SIEMPRE crea un backup del estado actual por si acaso.

## Frecuencia Recomendada

- **Desarrollo activo**: Backup manual antes de cada migración
- **Producción estable**: Backup manual semanal (hasta tener backups automáticos)
- **Antes de cambios críticos**: Siempre hacer backup

## Almacenamiento

- Los backups se guardan en `./backups/` (incluido en `.gitignore`)
- Considera subir backups importantes a:
  - Google Drive
  - Dropbox
  - AWS S3
  - GitHub Releases (para snapshots importantes)
