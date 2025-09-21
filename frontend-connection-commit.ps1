# Script para commitar as alterações da configuração da conexão entre frontend e backend
git add frontend/src/environments/environment.ts
git add frontend/src/environments/environment.prod.ts
git add frontend/src/app/services/auth.service.ts
git add frontend/src/app/services/evento.service.ts
git add frontend/src/app/services/galeria.service.ts
git add frontend/src/app/services/file-upload.service.ts
git add frontend/src/app/interceptors/auth.interceptor.ts
git add frontend/src/app/app.config.ts
git add frontend/src/app/utils/auth.ts
git add frontend/src/app/pages/login/login.component.ts
git add frontend/proxy.conf.json
git add frontend/package.json
git add frontend/angular.json
git add frontend/API_CONNECTION_README.md

git commit -m "feat(frontend): implementa configuração de conexão com backend"
git push origin pedro-ou-eduarda

Write-Host "Commit realizado com sucesso!"
