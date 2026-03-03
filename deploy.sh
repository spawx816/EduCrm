#!/bin/bash
set -e # Detener el script inmediatamente si ocurre algún error crítico

# Imprimir con colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RESET='\033[0m'

echo -e "${BLUE}=========================================${RESET}"
echo -e "${YELLOW}🚀 Iniciando despliegue de EduCRM...${RESET}"
echo -e "${BLUE}=========================================${RESET}\n"

APPS_DIR="$PWD"

# ========== 1. BACKEND ==========
echo -e "${GREEN}---> [1/2] Actualizando Backend...${RESET}"
if [ -d "$APPS_DIR/backend" ]; then
    echo "  > Configurando directorio seguro en Git..."
    git config --global --add safe.directory "$APPS_DIR/backend"

    echo "  > Descargando cambios (forzando la misma versión que GitHub)..."
    git fetch --all
    git reset --hard origin/main
    
    echo "  > Instalando dependencias (npm install)..."
    npm install
    
    echo "  > Construyendo aplicación backend (npm run build)..."
    npm run build
    
    # Aquí puedes cambiar "api" por el nombre de tu proceso en PM2 si es diferente
    echo "  > Reiniciando servicio en PM2..."
    pm2 restart api || pm2 restart all
    
    echo -e "  ✅ Backend actualizado.\n"
else
    echo -e "  ⚠️ Carpeta 'backend' no encontrada.\n"
fi

# ========== 2. FRONTEND ==========
echo -e "${GREEN}---> [2/2] Actualizando Frontend...${RESET}"
if [ -d "$APPS_DIR/frontend" ]; then
    cd "$APPS_DIR/frontend" || exit
    
    echo "  > Configurando directorio seguro en Git..."
    git config --global --add safe.directory "$APPS_DIR/frontend"

    echo "  > Descargando cambios (forzando la misma versión que GitHub)..."
    git fetch --all
    git reset --hard origin/main

    
    echo "  > Instalando dependencias (npm install)..."
    npm install
    
    echo "  > Construyendo aplicación (npm run build)..."
    npm run build
    
    echo -e "  ✅ Frontend actualizado y compilado construído.\n"
else
    echo -e "  ⚠️ Carpeta 'frontend' no encontrada.\n"
fi

echo -e "${BLUE}=========================================${RESET}"
echo -e "${YELLOW}🎉 ¡Despliegue completado con éxito!${RESET}"
echo -e "${BLUE}=========================================${RESET}"

# Regresar a la carpeta original
cd "$APPS_DIR" || exit
