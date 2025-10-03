#!/bin/bash
set -o errexit

echo "🚀 Iniciando build do frontend..."

# Verificar versão do Node
echo "📋 Versão do Node: $(node --version)"
echo "📋 Versão do NPM: $(npm --version)"

echo "📦 Instalando dependências..."
npm ci

echo "🔨 Compilando aplicação Angular para produção..."
npm run build

echo "✅ Build do frontend concluído!"

# Verificar se o build foi criado
if [ -d "dist/cha-revelacao" ]; then
    echo "✅ Diretório de build verificado!"
    ls -la dist/cha-revelacao/
else
    echo "❌ Erro: Diretório de build não foi criado!"
    exit 1
fi

echo "🌐 Frontend pronto para deploy!"
