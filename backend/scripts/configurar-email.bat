@echo off
REM Script para configurar variáveis de ambiente para o serviço de email
REM Execute este script antes de iniciar o backend para configurar as credenciais de email

echo Configurando variáveis de ambiente para o serviço de email...

REM Configure estas variáveis com suas próprias credenciais
set MAIL_HOST=smtp.gmail.com
set MAIL_PORT=587

REM Substitua pelos valores reais do seu email
set MAIL_USERNAME=italorochaj@gmail.com
set MAIL_PASSWORD=sua-senha-de-app-aqui

set FRONTEND_URL=http://localhost:4200

echo Variáveis de ambiente configuradas. Iniciando o backend...
cd ..
mvnw spring-boot:run