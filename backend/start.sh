#!/bin/bash
set -o errexit

echo "🚀 Iniciando aplicação backend..."

# Verificar se o JAR existe
if [ ! -f "target/revelacao-cha-0.0.1-SNAPSHOT.jar" ]; then
    echo "❌ JAR não encontrado. Executando build..."
    ./build.sh
fi

echo "🔧 Configurações do ambiente:"
echo "PORT: ${PORT:-8080}"
echo "DATABASE_URL: ${DATABASE_URL:-(não configurado)}"
echo "FRONTEND_URL: ${FRONTEND_URL:-(não configurado)}"

echo "▶️ Iniciando aplicação Spring Boot..."

# Executar a aplicação com configurações otimizadas para produção
exec java \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+UseG1GC \
    -Dspring.profiles.active=prod \
    -Dserver.port=${PORT:-8080} \
    -jar target/revelacao-cha-0.0.1-SNAPSHOT.jar