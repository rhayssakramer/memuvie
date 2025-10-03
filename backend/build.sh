#!/bin/bash
set -o errexit

echo "🚀 Iniciando build do backend..."

# Verificar se Java está disponível
if ! command -v java &> /dev/null; then
    echo "❌ Java não encontrado. Instalando OpenJDK 21..."
    # O Render vai usar a imagem Docker que já tem Java
fi

# Dar permissão de execução ao Maven Wrapper
chmod +x ./mvnw

echo "📦 Baixando dependências..."
./mvnw dependency:go-offline -B

echo "🔨 Compilando aplicação..."
./mvnw clean package -DskipTests

echo "✅ Build do backend concluído!"
echo "📄 JAR criado: target/revelacao-cha-0.0.1-SNAPSHOT.jar"

# Verificar se o JAR foi criado
if [ -f "target/revelacao-cha-0.0.1-SNAPSHOT.jar" ]; then
    echo "✅ Arquivo JAR verificado com sucesso!"
    ls -la target/revelacao-cha-0.0.1-SNAPSHOT.jar
else
    echo "❌ Erro: JAR não foi criado!"
    exit 1
fi