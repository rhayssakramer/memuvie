# Deploy Guide - Memuvie

## 🚀 Frontend (Vercel)

### Configuração Automática:
1. Conecte o repositório ao Vercel
2. Configure as seguintes opções:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/cha-revelacao`
   - **Install Command**: `npm install`

### Variáveis de Ambiente:
```
NODE_ENV=production
```

### Deploy Manual:
```bash
cd frontend
npm install
npm run build
npx vercel --prod
```

## 🌐 Backend (Render)

### URL de Produção:
- **Backend**: https://memuvie.onrender.com
- **Frontend**: https://memuvie.vercel.app (ou URL personalizada)

### Variáveis de Ambiente no Render:
```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://dpg-d3dtrc2li9vc73d87tag-a.oregon-postgres.render.com:5432/memuvie_db
DB_USERNAME=memuvie_db_user
DB_PASSWORD=98Z4x8fNW6hDGmskJyInlEDuOmQhrjKT
PORT=8080
CLOUDINARY_CLOUD_NAME=dvauwroyx
CLOUDINARY_API_KEY=414834393456219
CLOUDINARY_API_SECRET=u9aQX-vUJeiv6xXRdErvybNCHm8
JWT_SECRET=mySuperSecretJWTKememuvie_jwt_secret_key_2025_super_seguro_nao_compartilhar_123456789
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=memuviedigital@gmail.com
MAIL_PASSWORD=qntn tvcf hglp xpnl
```

## 🔄 CORS Configuration

O backend já está configurado para aceitar requisições dos seguintes domínios:
- `http://localhost:4200` (desenvolvimento)
- `https://memuvie.vercel.app` (produção Vercel)
- `https://memuvie-*.vercel.app` (preview deployments)
- `https://*-memuvie.vercel.app` (preview deployments)

## 📝 Notas Importantes:

1. **Primeiro Deploy**: Pode demorar alguns minutos
2. **Cold Starts**: O Render pode ter cold starts (primeiras requisições mais lentas)
3. **Preview Deployments**: O Vercel cria deployments automáticos para cada PR
4. **SSL**: Ambos os serviços fornecem HTTPS automaticamente

## 🐛 Troubleshooting:

### Erro de CORS:
- Verificar se a URL do frontend está na lista de origens permitidas
- Adicionar nova origem no `CorsConfig.java` se necessário

### Erro de Conexão API:
- Verificar se `environment.prod.ts` tem a URL correta do backend
- Verificar se o backend está rodando em https://memuvie.onrender.com

### Build Errors:
- Verificar versão do Node.js (recomendado: 18+)
- Limpar cache: `npm ci` em vez de `npm install`