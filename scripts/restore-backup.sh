#!/bin/bash

# Script para restaurar un backup de la base de datos de producción
# USO: ./scripts/restore-backup.sh <archivo_backup.sql>

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}⚠️  RESTAURACIÓN DE BACKUP${NC}"
echo ""

# Verificar que se proporcionó un archivo
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Debes especificar el archivo de backup${NC}"
    echo ""
    echo "Uso: ./scripts/restore-backup.sh <archivo_backup.sql>"
    echo ""
    echo "Backups disponibles:"
    ls -lh backups/*.sql 2>/dev/null || echo "  No se encontraron backups"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: El archivo '$BACKUP_FILE' no existe${NC}"
    exit 1
fi

# Verificar que .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    exit 1
fi

# Leer la URL de la base de datos
source .env

if [ -z "$DIRECT_URL" ]; then
    echo -e "${RED}❌ Error: DIRECT_URL no está definida en .env${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Información del backup:${NC}"
echo "   Archivo: $BACKUP_FILE"
echo "   Tamaño: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""

# ADVERTENCIA: Confirmación del usuario
echo -e "${RED}⚠️  ADVERTENCIA: Esta operación SOBRESCRIBIRÁ todos los datos actuales${NC}"
echo ""
echo "Antes de continuar:"
echo "1. ✅ Asegúrate de haber creado un backup del estado actual"
echo "2. ✅ Verifica que este es el backup correcto"
echo ""
read -p "¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar): " confirmation

if [ "$confirmation" != "SI" ]; then
    echo ""
    echo -e "${YELLOW}❌ Restauración cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🔄 Restaurando backup...${NC}"
echo ""

# Usar PostgreSQL 17 para compatibilidad con Supabase
PSQL="/opt/homebrew/opt/postgresql@17/bin/psql"

# Fallback a psql en PATH si no existe la versión 17
if [ ! -f "$PSQL" ]; then
    echo -e "${YELLOW}⚠️  PostgreSQL 17 no encontrado, usando psql del sistema${NC}"
    PSQL="psql"
fi

# Ejecutar restauración
"$PSQL" "$DIRECT_URL" < "$BACKUP_FILE"

# Verificar si la restauración fue exitosa
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Backup restaurado exitosamente${NC}"
    echo ""
    echo -e "${YELLOW}📝 Próximos pasos:${NC}"
    echo "   1. Verifica que los datos están correctos en tu aplicación"
    echo "   2. Ejecuta migraciones si es necesario: npm run db:migrate"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Error al restaurar backup${NC}"
    echo ""
    echo "Posibles causas:"
    echo "  - Conflictos en el esquema de la base de datos"
    echo "  - Problemas de conexión"
    echo "  - Archivo de backup corrupto"
    exit 1
fi
