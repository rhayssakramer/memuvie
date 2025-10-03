#!/bin/bash

echo "🚀 Building Memuvie Frontend for Production..."

# Build da aplicação
echo "📦 Building Angular application..."
npm run build:prod

if [ $? -eq 0 ]; then
    echo "✅ Angular build completed successfully!"

    echo "🐳 Building Docker image..."
    docker build -t memuvie-frontend .

    if [ $? -eq 0 ]; then
        echo "✅ Docker image built successfully!"
        echo "🌐 To run locally: docker run -p 8080:80 memuvie-frontend"
        echo "🔗 Then access: http://localhost:8080"
    else
        echo "❌ Docker build failed!"
        exit 1
    fi
else
    echo "❌ Angular build failed!"
    exit 1
fi
