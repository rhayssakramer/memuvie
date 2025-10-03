# Guia de Deploy no Vercel - Frontend Angular

## Pré-requisitos
- Conta no Vercel
- Repositório conectado ao GitHub
- Node.js 18+ 

## Configuração no Vercel Dashboard

### 1. Importar Projeto
- Acesse [vercel.com](https://vercel.com)
- Clique em "New Project"
- Importe o repositório `memuvie`

### 2. Configurações de Build
```
Framework: Angular
Build Command: npm run build:vercel
Output Directory: dist/cha-revelacao/browser
Install Command: npm ci
Node.js Version: 18.x
```

### 3. Variáveis de Ambiente
Configure estas variáveis no Vercel Dashboard:

```
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=dvauwroyx
API_URL=https://your-backend-url.vercel.app/api
```

### 4. Configurações de Domínio
- Configure um domínio personalizado se necessário
- Habilite HTTPS automático
- Configure redirects se necessário

## Scripts Disponíveis

- `npm run build:vercel` - Build otimizado para Vercel
- `npm run preview` - Preview local da build de produção
- `npm run analyze` - Análise do bundle size

## Recursos Habilitados

### Performance
- Compressão Gzip/Brotli automática
- Cache otimizado para assets estáticos
- Tree shaking e minificação

### Segurança
- Headers de segurança configurados
- HTTPS forçado
- Proteção XSS

### Monitoramento
- Analytics do Vercel habilitado
- Real User Monitoring (RUM)
- Core Web Vitals tracking

## Problemas Comuns

### Build Falha
- Verifique se todas as dependências estão instaladas
- Confirme se o Node.js está na versão correta
- Verifique se não há erros TypeScript

### Roteamento não Funciona
- Confirme se as rewrites estão configuradas no vercel.json
- Verifique se o Angular routing está configurado corretamente

### Assets não Carregam
- Verifique se os paths dos assets estão corretos
- Confirme se o outputDirectory está correto

## Monitoramento Pós-Deploy

1. Acesse o Vercel Dashboard
2. Monitore métricas de performance
3. Configure alertas se necessário
4. Verifique logs em caso de problemas

## Rollback

Em caso de problemas:
1. Acesse Vercel Dashboard
2. Vá para "Deployments"
3. Clique em "Promote to Production" na versão anterior

## Próximos Passos

1. Deploy do backend no Vercel
2. Atualizar API_URL no environment.prod.ts
3. Configurar domínio personalizado
4. Configurar monitoramento avançado