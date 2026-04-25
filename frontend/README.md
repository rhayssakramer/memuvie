<div align="center">

# 🎉 Memuvie — Frontend

**Onde a vida vira memória.**

Frontend em Angular 19 com Server-Side Rendering (SSR) para a plataforma **Memuvie** — uma aplicação web que transforma eventos especiais em memórias digitais compartilháveis.

[![Angular](https://img.shields.io/badge/Angular-19.1.0-DD0031?style=for-the-badge&logo=angular)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

</div>

---

## 📋 Índice

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Desenvolvimento](#-desenvolvimento)
- [Build e Deploy](#-build-e-deploy)
- [Arquitetura](#-arquitetura)
- [Componentes](#-componentes)
- [Serviços](#-serviços)
- [Interceptadores](#-interceptadores)
- [Rotas](#-rotas)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Scripts npm](#-scripts-npm)
- [Troubleshooting](#-troubleshooting)
- [Créditos](#-créditos)

---

## 🌟 Sobre

O **Memuvie Frontend** é uma aplicação **Single Page Application (SPA)** moderna com **Server-Side Rendering (SSR)**, desenvolvida em **Angular 19** com **TypeScript 5.7**.

Oferece uma experiência interativa e responsiva para os usuários da plataforma Memuvie, permitindo:

- 🔐 Autenticação e login seguro com JWT
- 📸 Upload de fotos e mensagens na galeria de eventos
- 🗳️ Votação em enquetes e revelação de resultados
- 👥 Identificação de usuário e perfil
- 📱 Experiência fully responsive (mobile, tablet, desktop)

### Por que SSR?
- **SEO melhorado** — Melhor indexação em buscadores
- **Primeira carga mais rápida** — Conteúdo renderizado no servidor
- **Melhor compatibilidade** — Funciona melhor com navegadores antigos
- **Performance mobile** — Reduz carga no cliente

---

## ✨ Funcionalidades

### Autenticação
- ✅ Registro de novo usuário
- ✅ Login com e-mail e senha
- ✅ Recuperação de senha via e-mail
- ✅ Logout e destruição de sessão
- ✅ Persistência de token JWT em localStorage

### Galeria de Eventos
- ✅ Visualizar eventos disponíveis
- ✅ Publicar posts com foto e mensagem
- ✅ Visualizar posts de outros usuários em tempo real
- ✅ Editar e deletar próprios posts
- ✅ Filtrar posts por evento

### Votação
- ✅ Votar em eventos com votação aberta
- ✅ Ver resultados da votação (parciais ou revelados)
- ✅ Manter registro do voto do usuário
- ✅ Alterar voto antes da revelação

### Perfil
- ✅ Visualizar dados do perfil
- ✅ Editar nome e foto de perfil
- ✅ Alterar senha
- ✅ Logout

### Admin (Gerenciador de Evento)
- ✅ Criar novo evento
- ✅ Editar evento
- ✅ Controlar votação (abrir/encerrar)
- ✅ Revelar resultado
- ✅ Gerenciar convidados

---

## 💻 Tecnologias

| Categoria | Tecnologia | Versão | Descrição |
|-----------|-----------|--------|-----------|
| **Framework** | Angular | 19.1.0 | Framework principal para SPA |
| **Linguagem** | TypeScript | 5.7 | Linguagem com tipagem estática |
| **SSR** | Angular SSR | 19.1.5 | Server-Side Rendering |
| **HTTP** | Angular HttpClient | 19.1.0 | Cliente HTTP para requisições |
| **Roteamento** | Angular Router | 19.1.0 | Roteamento de páginas |
| **Reatividade** | RxJS | 7.8.0 | Programação reativa com Observables |
| **Formulários** | Angular Forms | 19.1.0 | Validação e gerenciamento de forms |
| **Runtime** | Node.js | 18+ | Ambiente de execução |
| **Build** | Webpack | via @angular-devkit | Bundler |
| **Markup** | HTML5 | — | Marcação semântica |
| **Estilos** | CSS3 / SCSS | — | Estilização responsiva |
| **Gerenciador Pacotes** | npm | 10+ | Dependências |

---

## 📁 Estrutura do Projeto

```
frontend/
├── 📄 angular.json                    # Configuração do Angular CLI
├── 📄 package.json                    # Dependências npm e scripts
├── 📄 tsconfig.json                   # Configuração TypeScript global
├── 📄 tsconfig.app.json               # Configuração TypeScript para aplicação
├── 📄 tsconfig.spec.json              # Configuração TypeScript para testes
├── 📄 vercel.json                     # Configuração de deploy na Vercel
├── 📄 proxy.conf.json                 # Proxy reverso para dev (localhost:5000)
├── 📄 proxy.conf.dev.json             # Proxy alternativo para desenvolvimento
├── 📄 README.md                       # Este arquivo
│
└── 📂 src/
    ├── 📄 index.html                  # Página HTML principal
    ├── 📄 main.ts                     # Bootstrap do Angular (Browser)
    ├── 📄 main.server.ts              # Bootstrap para SSR
    ├── 📄 server.ts                   # Servidor Express para SSR
    ├── 📄 styles.css                  # Estilos globais da aplicação
    │
    ├── 📂 environments/
    │   ├── 📄 environment.ts          # Configurações de desenvolvimento
    │   └── 📄 environment.prod.ts     # Configurações de produção
    │
    ├── 📂 app/                        # Módulo raiz da aplicação
    │   ├── 📄 app.component.ts        # Componente raiz
    │   ├── 📄 app.component.html      # Template raiz (navbar, router-outlet)
    │   ├── 📄 app.component.css       # Estilos raiz
    │   ├── 📄 app.routes.ts           # Definição de rotas da aplicação
    │   │
    │   ├── 📂 pages/                  # Páginas/views da aplicação
    │   │   ├── 📂 login/              # Componente de login
    │   │   ├── 📂 esqueci-senha/      # Componente de esqueci senha
    │   │   ├── 📂 redefinir-senha/    # Componente de redefinir senha
    │   │   ├── 📂 home/               # Página inicial com lista de eventos
    │   │   ├── 📂 identification/     # Página de identificação do usuário
    │   │   ├── 📂 interaction/        # Página de votação e interação
    │   │   └── 📂 gallery/            # Página da galeria de fotos
    │   │
    │   ├── 📂 shared/                 # Componentes e módulos compartilhados
    │   │   ├── 📂 components/         # Componentes reutilizáveis
    │   │   ├── 📂 models/             # Interfaces e tipos TypeScript
    │   │   └── 📂 pipes/              # Pipes customizados (filtros)
    │   │
    │   ├── 📂 services/               # Serviços Angular
    │   │   ├── auth.service.ts        # Serviço de autenticação
    │   │   ├── evento.service.ts      # Serviço de eventos
    │   │   ├── galeria.service.ts     # Serviço de galeria
    │   │   ├── voto.service.ts        # Serviço de votos
    │   │   ├── usuario.service.ts     # Serviço de usuários
    │   │   ├── storage.service.ts     # Serviço de localStorage
    │   │   ├── loading.service.ts     # Serviço de estado de loading
    │   │   └── toast.service.ts       # Serviço de notificações
    │   │
    │   ├── 📂 interceptors/           # Interceptadores HTTP
    │   │   ├── auth.interceptor.ts    # Adiciona JWT ao header
    │   │   ├── error.interceptor.ts   # Trata erros HTTP
    │   │   └── loading.interceptor.ts # Controla estado de loading
    │   │
    │   └── 📂 utils/                  # Funções utilitárias
    │       ├── constants.ts           # Constantes da aplicação
    │       ├── validators.ts          # Validadores customizados
    │       └── helpers.ts             # Funções auxiliares
    │
    ├── 📂 assets/                     # Arquivos estáticos
    │   ├── 📂 images/                 # Imagens da aplicação
    │   ├── 📂 icons/                  # Ícones
    │   └── 📂 fonts/                  # Fontes customizadas
    │
    └── 📂 public/                     # Pasta raiz do servidor estático

```

---

## 📌 Pré-requisitos

- **Node.js 18+** — [Download aqui](https://nodejs.org/)
- **npm 10+** — Incluído com Node.js
- **Angular CLI 19+** (opcional, mas recomendado)
- **Git** — Para clonar o repositório
- **Backend em execução** — `http://localhost:5000`

---

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/memuvie.git
cd memuvie/frontend
```

### 2. Instale as dependências

```bash
npm install

# Ou se preferir usar Yarn
yarn install
```

### 3. Configure o proxy (opcional)

O arquivo `proxy.conf.json` já está configurado para apontar para `http://localhost:5000`.
Se seu backend estiver em outra porta, atualize o arquivo:

```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  },
  "/auth": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## 🚀 Desenvolvimento

### Iniciar servidor de desenvolvimento

```bash
npm start
```

A aplicação estará disponível em: **`http://localhost:4200`**

### O que acontece ao rodar `npm start`?

1. Angular CLI inicia o servidor de desenvolvimento
2. Webpack compila o código TypeScript
3. Proxy reverso redireciona `/api/**` para `http://localhost:5000`
4. Hot reload está ativado — mudanças no código recarregam automaticamente
5. Terminal mostra build status e erros em tempo real

### Acessar o servidor

- **Frontend:** `http://localhost:4200`
- **Backend API:** `http://localhost:5000`
- **Swagger UI:** `http://localhost:5000/swagger`

---

## 🏗️ Build e Deploy

### Build para Desenvolvimento

```bash
npm run watch
```

Recompila a cada mudança no código. Saída em `dist/memuvie/browser/`.

### Build para Produção

```bash
npm run build:prod
```

Otimizações incluídas:
- Minificação de código
- Tree-shaking (remoção de código não usado)
- Lazy loading de rotas
- Análise de bundle

Saída em: `dist/memuvie/browser/`

### Build para Homolog

```bash
npm run build:homolog
```

Configurações intermediárias entre dev e prod.

### Build com SSR

```bash
npm run build:vercel
```

Inclui SSR para Vercel. Saída em: `dist/memuvie/browser/` e `dist/memuvie/server/`

### Deploy na Vercel

A aplicação é deployada automaticamente na Vercel a cada push na branch principal.

```bash
# Deploy manual (requer Vercel CLI)
vercel deploy
```

---

## 🏛️ Arquitetura

### Fluxo de Requisição

```
Usuario Browser
     ↓
Angular Router (Client-side)
     ↓
Componente / Página
     ↓
Serviço Angular
     ↓
HTTP Interceptor (adiciona JWT)
     ↓
HttpClient → Backend API (http://localhost:5000)
     ↓
Response → HTTP Interceptor (trata erros)
     ↓
Serviço → Componente (Observable / RxJS)
     ↓
Template → UI atualizada
```

### Estrutura de Pastas por Funcionalidade

```
pages/
├── login/                 # Módulo de autenticação
├── home/                  # Lista de eventos
├── identification/        # Identificação do usuário
├── interaction/           # Votação (interact with event)
└── gallery/              # Galeria de fotos

services/
├── auth.service.ts       # Gerencia tokens, login/logout
├── evento.service.ts     # CRUD de eventos
├── voto.service.ts       # Votos
├── galeria.service.ts    # Posts da galeria
└── usuario.service.ts    # Dados do usuário

interceptors/
├── auth.interceptor.ts   # Adiciona Authorization header
└── error.interceptor.ts  # Tratamento centralizado de erros
```

---

## 🧩 Componentes Principais

### `LoginComponent`
- Formulário de login com validação
- Recuperação de senha
- Armazenamento de JWT em localStorage
- Redirecionamento para home após login

**Arquivo:** `pages/login/`

### `HomeComponent`
- Lista de eventos disponíveis
- Filtros (ativos, com votação aberta, meus eventos)
- Buttons para entrar no evento
- Paginação (se aplicável)

**Arquivo:** `pages/home/`

### `IdentificationComponent`
- Identificação do usuário dentro do evento
- Seleção de nome de usuário ou email
- Carregamento de dados do usuário
- Navegação para página de interação

**Arquivo:** `pages/identification/`

### `InteractionComponent`
- Votação em enquetes
- Visualização de resultados
- Alteração de voto (antes da revelação)
- Transição para revelação do resultado

**Arquivo:** `pages/interaction/`

### `GalleryComponent`
- Galeria de posts do evento
- Upload de foto + mensagem
- Visualização de posts em tempo real
- Edição e exclusão de próprios posts

**Arquivo:** `pages/gallery/`

---

## 🔌 Serviços

### `AuthService`
```typescript
login(email: string, senha: string): Observable<LoginResponse>
register(usuario: RegistroDTO): Observable<LoginResponse>
logout(): void
isAuthenticated(): boolean
getToken(): string | null
```

### `EventoService`
```typescript
listarEventos(): Observable<Evento[]>
buscarEvento(id: number): Observable<Evento>
criarEvento(evento: CreateEventoDTO): Observable<Evento>
atualizarEvento(id: number, evento: UpdateEventoDTO): Observable<Evento>
encerrarVotacao(id: number): Observable<void>
revelarResultado(id: number): Observable<Evento>
```

### `VotoService`
```typescript
votar(voto: VotoDTO): Observable<Voto>
meuVoto(eventoId: number): Observable<Voto | null>
votosDoEvento(eventoId: number): Observable<Voto[]>
```

### `GaleriaService`
```typescript
criarPost(post: CreateGaleriaDTO): Observable<GaleriaPost>
listarPosts(eventoId: number): Observable<GaleriaPost[]>
atualizarPost(id: number, post: UpdateGaleriaDTO): Observable<GaleriaPost>
deletarPost(id: number): Observable<void>
```

---

## 🔄 Interceptadores

### `AuthInterceptor`
Adiciona o token JWT ao header `Authorization` de todas as requisições:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### `ErrorInterceptor`
Trata erros HTTP centralizadamente:
- 401 Unauthorized → Logout automático
- 403 Forbidden → Redirecionar para home
- 404 Not Found → Mostrar mensagem de erro
- 500 Server Error → Mostrar mensagem de erro
- Network Error → Mostrar mensagem de offline

---

## 📍 Rotas

| Rota | Componente | Auth | Descrição |
|------|-----------|------|-----------|
| `/` | `HomeComponent` | ❌ | Página inicial com lista de eventos |
| `/login` | `LoginComponent` | ❌ | Formulário de login |
| `/esqueci-senha` | `EsqueceuSenhaComponent` | ❌ | Recuperação de senha |
| `/redefinir-senha` | `RedefinirSenhaComponent` | ❌ | Redefinir senha com token |
| `/evento/:id/identificacao` | `IdentificationComponent` | ✅ | Identificação para votação |
| `/evento/:id/votacao` | `InteractionComponent` | ✅ | Votação e interação |
| `/evento/:id/galeria` | `GalleryComponent` | ✅ | Galeria de fotos |
| `/perfil` | `PerfilComponent` | ✅ | Dados do perfil |
| `**` | — | — | 404 Not Found |

> ✅ = Requer autenticação (token JWT)

---

## 🔐 Variáveis de Ambiente

### `src/environments/environment.ts` (Desenvolvimento)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000'
};
```

### `src/environments/environment.prod.ts` (Produção)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://memuvie.onrender.com'
};
```

### Usar nos Componentes

```typescript
import { environment } from '../../../environments/environment';

export class MeuComponente {
  apiUrl = environment.apiUrl;
}
```

---

## 📦 Scripts npm

```bash
# Iniciar servidor de desenvolvimento
npm start

# Compilar com watch (recarga automática)
npm run watch

# Build para produção
npm run build:prod

# Build para homolog
npm run build:homolog

# Build para Vercel (com SSR)
npm run build:vercel

# SSR - Servir a aplicação renderizada no servidor
npm run serve:ssr:cha-revelacao

# Testes (Jasmine)
npm test

# Analisar bundle de produção
npm run analyze

# Verificar estilos (lint)
# (não configurado atualmente)
```

---

## 🔧 Troubleshooting

### Erro: "Cannot find module '@angular/...'"

**Solução:**
```bash
npm install
# Ou limpar cache
npm cache clean --force
npm install
```

### Erro: "Port 4200 already in use"

**Solução:**
```bash
# Usar porta diferente
ng serve --port 4300

# Ou matar processo na porta 4200 (Windows)
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti :4200 | xargs kill -9
```

### Erro: "proxy not working" (requisições para API falham)

**Solução:**
1. Verificar se `proxy.conf.json` está correto
2. API deve estar rodando em `http://localhost:5000`
3. Reiniciar o servidor (`npm start`)
4. Verificar console do navegador (DevTools → Network) para ver URL real das requisições

### Erro: "401 Unauthorized" em requisições

**Solução:**
1. Token JWT expirou — fazer login novamente
2. Verificar se `localStorage` tem a chave `token`
3. Verificar se `AuthInterceptor` está adicionando header corretamente

### Build lento ou travando

**Solução:**
```bash
# Limpar cache do Angular
rm -rf dist node_modules .angular
npm install

# Usar build incremental (apenas desenvolvimento)
npm run watch
```

---

### 📜 Regras e Validações

#### **Autenticação e Autorização:**
- 🔐 **Login obrigatório** para participar
- 🎫 **JWT Token** para autenticação
- ⏰ **Sessão válida** por 24 horas
- 🛡️ **Proteção CSRF** ativada

#### **Upload de Mídia:**
- 📸 **Imagens:** JPG, PNG, GIF (máx. 5MB)
- 🎥 **Vídeos:** MP4, AVI, MOV (máx. 50MB)
- 🔍 **Validação de conteúdo** automática
- 🗑️ **Possibilidade de exclusão** pelo autor

#### **Comentários e Mensagens:**
- ✍️ **Mínimo 10 caracteres**
- ❌ **Máximo 500 caracteres**
- 🚫 **Filtro de palavras inadequadas**
- ✏️ **Edição permitida** em 5 minutos


### 📝 Especificações de Conteúdo

#### **Tipos de Conteúdo Permitidos**

#### **📸 Fotos:**
- Ultrassons do bebê
- Fotos da família esperando
- Preparativos para o chá
- Decoração do evento
- Momentos especiais

#### **🎥 Vídeos:**
- Palpites dos convidados
- Mensagens para o bebê
- Momentos da revelação
- Depoimentos da família

#### **💌 Mensagens:**
- Palpites justificados
- Desejos para o bebê
- Mensagens para os pais
- Histórias e memórias


### ⚙️ Especificações Técnicas

#### **Performance:**
- ⚡ **Tempo de carregamento:** < 3 segundos
- 📱 **First Contentful Paint:** < 1.5 segundos
- 🎯 **Lighthouse Score:** > 90
- 📊 **Bundle size:** < 2MB

#### **Compatibilidade:**
- 🌐 **Navegadores:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- 📱 **Mobile:** iOS 14+, Android 8+
- 🖥️ **Desktop:** Windows 10+, macOS 11+, Linux Ubuntu 20.04+

#### **Segurança:**
- 🔒 **HTTPS obrigatório**
- 🛡️ **Headers de segurança** configurados
- 🔐 **Senhas hasheadas** com BCrypt
- 🚫 **Proteção XSS e CSRF**
- 🔍 **Validação de entrada** rigorosa

#### **API:**
- 📡 **RESTful API** com padrões REST
- 📋 **Documentação OpenAPI 3.0**
- 📊 **Rate limiting** implementado
- 🔄 **Versionamento** de API
- ✅ **Códigos de status** HTTP padronizados


## 🏗️ Diagrama da Aplicação

```mermaid
graph TB
    subgraph "Frontend (Angular)"
        A[Login Page] --> B[Home Page]
        B --> C[Identification Page]
        C --> D[Interaction Page]
        D --> E[Gallery Page]
        
        F[Auth Service] --> G[HTTP Interceptor]
        H[Event Service] --> I[Gallery Service]
        J[Toast Service] --> K[File Upload Service]
    end
    
    subgraph "Backend (Spring Boot)"
        L[Auth Controller] --> M[User Service]
        N[Event Controller] --> O[Event Service]
        P[Gallery Controller] --> Q[Gallery Service]
        R[Vote Controller] --> S[Vote Service]
        
        M --> T[(PostgreSQL)]
        O --> T
        Q --> T
        S --> T
        
        U[Cloudinary Service] --> V[Cloudinary API]
        W[Email Service] --> X[SMTP Server]
    end
    
    subgraph "External Services"
        Y[Cloudinary Storage]
        Z[Email Provider]
        AA[Render Deploy]
    end
    
    A -.->|HTTP/HTTPS| L
    D -.->|HTTP/HTTPS| N
    E -.->|HTTP/HTTPS| P
    D -.->|HTTP/HTTPS| R
    
    U -.->|API| Y
    W -.->|SMTP| Z
    
    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style C fill:#e1f5fe
    style D fill:#e1f5fe
    style E fill:#e1f5fe
    style T fill:#c8e6c9
    style Y fill:#fff3e0
    style Z fill:#fff3e0
    style AA fill:#f3e5f5
```

---

## ▶️ Execução do Projeto

### **1. Clone do Repositório**
```bash
git clone https://github.com/rhayssakramer/pedro-ou-eduarda.git
cd pedro-ou-eduarda
```

### **2. Configuração do Banco de Dados**

#### **Opção A: PostgreSQL Local**
```bash
# Instalar PostgreSQL
# Criar banco de dados
createdb cha_revelacao

# Configurar variáveis de ambiente
export DB_URL=jdbc:postgresql://localhost:5432/cha_revelacao
export DB_USERNAME=seu_usuario
export DB_PASSWORD=sua_senha
```

#### **Opção B: Docker Compose**
```bash
cd backend
docker-compose up -d postgres
```

### **3. Configuração do Backend**

#### **Variáveis de Ambiente**
Crie um arquivo `.env` no diretório `backend`:
```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/cha_revelacao
DB_USERNAME=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
JWT_EXPIRATION=86400000

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_app
```

#### **Executar Backend**
```bash
cd backend

# Usando Maven Wrapper
./mvnw spring-boot:run

# Ou usando Maven instalado
mvn spring-boot:run

# Ou usando Docker
docker-compose up backend
```

### **4. Configuração do Frontend**

#### **Instalar Dependências**
```bash
cd frontend
npm install
```

#### **Configurar Ambiente**
Copie `.env.example` para `.env` e configure:
```env
API_URL=http://localhost:8080/api
CLOUDINARY_CLOUD_NAME=seu_cloud_name
```

#### **Executar Frontend**
```bash
# Desenvolvimento
npm start

# Build para produção
npm run build:prod

# Preview da build
npm run preview
```

### **5. Acesso à Aplicação**

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8080
- **Documentação API:** http://localhost:8080/swagger-ui.html
- **Banco H2 (dev):** http://localhost:8080/h2-console

### **6. Usuários de Teste**

#### **Administrador**
- **Email:** admin@memuvie.com
- **Senha:** admin123

#### **Usuário Teste**
- **Email:** teste@memuvie.com
- **Senha:** teste123


## 🚢 Deploy

### **Deploy Automático (Render)**

O projeto está configurado para deploy automático no Render:

1. **Push para main** triggers automatic deploy
2. **Backend e Frontend** são deployados juntos
3. **Banco PostgreSQL** gerenciado pelo Render
4. **Variáveis de ambiente** configuradas no painel Render

### **URLs de Produção**
- **Aplicação:** https://pedro-ou-eduarda.onrender.com
- **API:** https://pedro-ou-eduarda-api.onrender.com

### **Deploy Manual**

#### **Docker**
```bash
# Build das imagens
docker-compose build

# Deploy
docker-compose up -d

# Logs
docker-compose logs -f
```

#### **Heroku**
```bash
# Login no Heroku
heroku login

# Criar aplicação
heroku create pedro-ou-eduarda

# Deploy
git push heroku main
```

## 🔗 Links Úteis

### **Documentação Oficial**
- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular Material](https://material.angular.io/)

### **Ferramentas**
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Vercel Docs](https://vercel.com/docs)
- [VS Code](https://code.visualstudio.com/)

### **Recursos**
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS-Tricks](https://css-tricks.com/)

### **Aplicação**
- 📖 **Documentação da API:** [API Docs](https://pedro-ou-eduarda-api.onrender.com/swagger-ui.html)
- 📊 **Status do Sistema:** [Status Page](https://status.render.com)

### **Repositórios**
- 📂 **Repositório Principal:** [GitHub](https://github.com/rhayssakramer/pedro-ou-eduarda)
- 🔄 **Releases:** [Releases](https://github.com/rhayssakramer/pedro-ou-eduarda/releases)
- 🐛 **Issues:** [Bug Reports](https://github.com/rhayssakramer/pedro-ou-eduarda/issues)

### **Tecnologias**
- ☕ **Spring Boot:** [spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
- 🅰️ **Angular:** [angular.io](https://angular.io)
- 🐳 **Docker:** [docker.com](https://docker.com)
- 🚀 **Render:** [render.com](https://render.com)
- ☁️ **Cloudinary:** [cloudinary.com](https://cloudinary.com)

### **Memuvie**
- 🏢 **Site Institucional:** [memuvie.com](https://memuvie.com) (em breve)
- 📧 **Contato:** contato@memuvie.com (em breve)
- 💼 **LinkedIn:** [Memuvie Company](https://linkedin.com/company/memuvie) (em breve)
- 📱 **Instagram:** [@memuvie](https://instagram.com/memuvie_oficial)

---

## 👥 Créditos

### **Equipe Memuvie**
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/rhayssakramer">
        <img src="https://github.com/rhayssakramer.png" width="100px" alt="Rhayssa Kramer"/>
        <br />
        <sub><b>Rhayssa Kramer</b></sub>
      </a>
      <br />
      <small>Tech Lead & Full Stack Developer</small>
    </td>
    <td align="center">
    <a href="https://github.com/italorochaj">
      <img src="https://avatars.githubusercontent.com/u/102812593?v=4" width="100px" alt="Memuvie Team"/>
      <br />
      <sub><b>Italo Rocha</b></sub>
      <br />
      </a>
      <small>Product Development Team</small>
    </td>
  </tr>
</table>

<div align="center">
  <h3>Feito com 💜 pela equipe Memuvie para celebrar momentos especiais!</h3>
  
  <p>
    <img src="https://img.shields.io/badge/Memuvie-Viva%20agora%2C%20reviva%20sempre!-pink?style=for-the-badge" alt="Memuvie Slogan">
  </p>
  
  <p>
    <sub>© 2025 Memuvie. Todos os direitos reservados.</sub>
  </p>
</div>
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **Conexão com internet** - Para recursos externos