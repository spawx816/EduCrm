#!/bin/bash
set -e # Detener el script inmediatamente si ocurre algún error crítico

# Imprimir con colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RESET='\033[0m'

echo -e "${BLUE}=========================================${RESET}"
echo -e "${YELLOW}🚀 Iniciando despliegue de EduCRM Mejorado...${RESET}"
echo -e "${BLUE}=========================================${RESET}\n"

APPS_DIR="$PWD"

# Configurar directorios seguros para Git
git config --global --add safe.directory "$APPS_DIR"

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

# Actualizar el repositorio principal primero
echo -e "${GREEN}---> [0/2] Actualizando Repositorio Raíz...${RESET}"
git fetch --all
git reset --hard origin/main

# ========== 1. BACKEND ==========
echo -e "${GREEN}---> [1/2] Actualizando Backend...${RESET}"
if [ -d "$APPS_DIR/backend" ]; then
    cd "$APPS_DIR/backend" || exit

    echo "  > Sincronizando código backend..."
    git fetch --all
    git reset --hard origin/main
    
    clean_dir
    
    echo "  > Instalando dependencias (npm install)..."
    npm install
    
    echo "  > Limpiando y Construyendo Backend..."
    rm -rf dist
    npm run build
    
    echo "  > Aplicando Migraciones de Base de Datos..."
    # Ejecutar la migración de pagos de instructor (la columna payment_date)
    psql "postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm" -c "ALTER TABLE instructor_payments ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;" || echo "Aviso: Error o columna ya existe en instructor_payments"

    # Otros scripts necesarios
    node create_admin_user.js || true
    
    echo "  > Reiniciando procesos PM2..."
    pm2 delete educrm-api || true
    PORT=3000 pm2 start dist/main.js --name "educrm-api"
    pm2 save
    
    echo -e "  ✅ Backend actualizado.\n"
else
    echo -e "  ⚠️ Carpeta 'backend' no encontrada.\n"
fi

# ========== 2. FRONTEND ==========
echo -e "${GREEN}---> [2/2] Actualizando Frontend...${RESET}"
if [ -d "$APPS_DIR/frontend" ]; then
    cd "$APPS_DIR/frontend" || exit
    
    echo "  > Sincronizando código frontend..."
    git fetch --all
    git reset --hard origin/main

    clean_dir
    
    echo "  > Instalando dependencias..."
    npm install
    
    echo "  > Construyendo aplicación Frontend (Vite)..."
    rm -rf dist
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
