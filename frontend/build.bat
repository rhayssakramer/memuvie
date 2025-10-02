@echo off
echo 🚀 Building Memuvie Frontend for Production...

REM Build da aplicação
echo 📦 Building Angular application...
call npm run build:prod

if %errorlevel% equ 0 (
    echo ✅ Angular build completed successfully!

    echo 🐳 Building Docker image...
    docker build -t memuvie-frontend .

    if %errorlevel% equ 0 (
        echo ✅ Docker image built successfully!
        echo 🌐 To run locally: docker run -p 8080:80 memuvie-frontend
        echo 🔗 Then access: http://localhost:8080
    ) else (
        echo ❌ Docker build failed!
        exit /b 1
    )
) else (
    echo ❌ Angular build failed!
    exit /b 1
)
