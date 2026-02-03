#!/bin/bash

# Script para crear backup manual de la base de datos de producción
# USO: ./scripts/backup-production.sh

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔐 Script de Backup de Producción${NC}"
echo ""

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

# Crear directorio de backups si no existe
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Generar nombre de archivo con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo -e "${YELLOW}📦 Creando backup...${NC}"
echo "   Archivo: $BACKUP_FILE"
echo ""

# Usar PostgreSQL 17 para compatibilidad con Supabase
PG_DUMP="/opt/homebrew/opt/postgresql@17/bin/pg_dump"

# Fallback a pg_dump en PATH si no existe la versión 17
if [ ! -f "$PG_DUMP" ]; then
    echo -e "${YELLOW}⚠️  PostgreSQL 17 no encontrado, usando pg_dump del sistema${NC}"
    PG_DUMP="pg_dump"
fi

# Ejecutar pg_dump
"$PG_DUMP" "$DIRECT_URL" > "$BACKUP_FILE"

# Verificar si el backup fue exitoso
if [ $? -eq 0 ]; then
    # Obtener tamaño del archivo
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo ""
    echo -e "${GREEN}✅ Backup creado exitosamente${NC}"
    echo "   Tamaño: $SIZE"
    echo "   Ubicación: $BACKUP_FILE"
    echo ""
    echo -e "${YELLOW}💡 Para restaurar este backup:${NC}"
    echo "   psql \"\$DIRECT_URL\" < $BACKUP_FILE"
    echo ""
else
    echo -e "${RED}❌ Error al crear backup${NC}"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Listar backups existentes
echo -e "${YELLOW}📋 Backups disponibles:${NC}"
ls -lh "$BACKUP_DIR"
echo ""

# Recordatorio de limpieza
echo -e "${YELLOW}⚠️  Recuerda eliminar backups antiguos periódicamente${NC}"
