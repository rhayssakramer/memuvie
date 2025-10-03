# ⚡ Deploy Rápido no Vercel

## 1. Pré-requisitos ✅
- [ ] Conta no Vercel
- [ ] Repositório no GitHub
- [ ] Node.js 18+

## 2. Deploy em 3 passos 🚀

### Passo 1: Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe o repositório `memuvie`

### Passo 2: Configurar Build
```
Framework Preset: Angular
Build Command: npm run build:vercel
Output Directory: dist/cha-revelacao/browser
Install Command: npm ci
Node.js Version: 18.x
Root Directory: frontend
```

### Passo 3: Deploy
- Clique em "Deploy"
- Aguarde o build (2-3 minutos)
- Sua aplicação estará live!

## 3. Configurações Opcionais ⚙️

### Variáveis de Ambiente
No Vercel Dashboard > Settings > Environment Variables:
```
NODE_ENV=production
API_URL=https://your-backend-url.vercel.app/api
CLOUDINARY_CLOUD_NAME=dvauwroyx
```

### Domínio Personalizado
1. Settings > Domains
2. Adicionar domínio
3. Configurar DNS

## 4. Monitoramento 📊
- Analytics automático habilitado
- Core Web Vitals tracking
- Error boundary configurado

## 5. Problemas Comuns 🔧

**Build falha?**
- Verificar Node.js version (18.x)
- Executar `npm ci` localmente
- Verificar erros TypeScript

**404 em rotas?**
- Rewrites configuradas no vercel.json ✅
- Angular routing configurado ✅

**Assets não carregam?**
- Verificar outputDirectory ✅
- Cache headers configurados ✅

## 6. URLs Importantes 🔗
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentação**: https://vercel.com/docs
- **Status**: https://status.vercel.com

---
✨ **Deploy automático**: Cada push para `main` gera um novo deploy!