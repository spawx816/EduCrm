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

# Configurar directorios seguros para Git
git config --global --add safe.directory "$APPS_DIR"
git config --global --add safe.directory "$APPS_DIR/backend"
git config --global --add safe.directory "$APPS_DIR/frontend"

HARD_RESET=false
if [ "$1" == "--hard" ]; then
    HARD_RESET=true
    echo -e "${YELLOW}⚠️ MODO HARD ACTIVADO: Se eliminarán node_modules y dist para una limpieza total.${RESET}"
fi

# Function to clean directories
clean_dir() {
    if [ "$HARD_RESET" = true ]; then
        echo "  > [HARD] Eliminando node_modules, package-lock.json y dist..."
        rm -rf node_modules package-lock.json dist
    fi
}

# ========== 1. BACKEND ==========
echo -e "${GREEN}---> [1/2] Actualizando Backend...${RESET}"
if [ -d "$APPS_DIR/backend" ]; then
    cd "$APPS_DIR/backend" || exit

    echo "  > Descargando cambios (forzando la misma versión que GitHub)..."
    git fetch --all
    git reset --hard origin/main
    
    clean_dir
    
    echo "  > Instalando dependencias (npm install)..."
    npm install
    
    echo "  > Construyendo aplicación backend (npm run build)..."
    npm run build
    
    # Intentar reiniciar o iniciar el proceso en PM2
    echo "  > Reiniciando/Iniciando servicio en PM2..."
    pm2 restart educrm-api || PORT=3012 pm2 start dist/main.js --name "educrm-api"
    
    echo -e "  ✅ Backend actualizado.\n"
else
    echo -e "  ⚠️ Carpeta 'backend' no encontrada.\n"
fi

# ========== 2. FRONTEND ==========
echo -e "${GREEN}---> [2/2] Actualizando Frontend...${RESET}"
if [ -d "$APPS_DIR/frontend" ]; then
    cd "$APPS_DIR/frontend" || exit
    
    echo "  > Descargando cambios (forzando la misma versión que GitHub)..."
    git fetch --all
    git reset --hard origin/main

    clean_dir
    
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
