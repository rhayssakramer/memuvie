#!/bin/bash
# Script para configurar variáveis de ambiente para o serviço de email
# Execute este script antes de iniciar o backend para configurar as credenciais de email

echo "Configurando variáveis de ambiente para o serviço de email..."

# Configure estas variáveis com suas próprias credenciais
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587

# Substitua pelos valores reais do seu email
export MAIL_USERNAME=italorochaj@gmail.com
export MAIL_PASSWORD=sua-senha-de-app-aqui

export FRONTEND_URL=http://localhost:4200

echo "Variáveis de ambiente configuradas. Iniciando o backend..."
cd ..
./mvnw spring-boot:run