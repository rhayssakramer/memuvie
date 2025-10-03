# Frontend - Memuvie

Frontend Angular da aplicação Memuvie, otimizado para deploy no Vercel.

## 🚀 Deploy no Vercel

Este projeto está configurado para deploy automático no Vercel. Consulte [`VERCEL_DEPLOY.md`](./VERCEL_DEPLOY.md) para instruções detalhadas.

## 📋 Pré-requisitos

- Node.js 18+
- NPM ou Yarn
- Angular CLI

## 🛠️ Desenvolvimento

### Instalação

```bash
npm install
```

### Servidor de desenvolvimento

```bash
npm start
# ou
ng serve
```

Acesse `http://localhost:4200/`. A aplicação recarregará automaticamente quando você modificar os arquivos.

### Scripts disponíveis

- `npm start` - Servidor de desenvolvimento com proxy
- `npm run build` - Build de produção
- `npm run build:vercel` - Build otimizado para Vercel
- `npm run preview` - Preview local da build de produção
- `npm run test` - Testes unitários
- `npm run analyze` - Análise do bundle size

## 🏗️ Build

### Desenvolvimento

```bash
npm run build
```

### Produção (Vercel)

```bash
npm run build:vercel
```

Os artefatos serão armazenados no diretório `dist/cha-revelacao/browser/`.

## 🧪 Testes

### Testes unitários

```bash
npm test
```

### Coverage

```bash
npm run test -- --coverage
```

## 📁 Estrutura do projeto

```text
src/
├── app/
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços
│   ├── shared/          # Componentes compartilhados
│   └── utils/           # Utilitários
├── assets/              # Assets estáticos
└── environments/        # Configurações de ambiente
```

## 🌍 Ambientes

- **Development**: `environment.ts` - API local (localhost:8080)
- **Production**: `environment.prod.ts` - API no Vercel

## 🔧 Configuração

### Variáveis de ambiente

Copie `.env.example` para `.env.local` e configure:

```bash
API_URL=https://your-backend-url.vercel.app/api
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
```

### Proxy para desenvolvimento

O arquivo `proxy.conf.json` configura o proxy para a API local durante o desenvolvimento.

## 📊 Performance

- Bundle otimizado com tree-shaking
- Lazy loading de rotas
- Compressão automática no Vercel
- Cache otimizado para assets estáticos

## 🔒 Segurança

- Headers de segurança configurados
- Sanitização de inputs
- Proteção XSS
- HTTPS forçado em produção

## 📈 Monitoramento

- Vercel Analytics habilitado
- Core Web Vitals tracking
- Error tracking integrado

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
