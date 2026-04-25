<div align="center">

# 🎉 Memuvie

**Onde a vida vira memória.**

Memuvie é uma plataforma para registrar, guardar e reviver momentos especiais como pequenas cápsulas de tempo digitais. Transforma festas e eventos em memórias digitais inesquecíveis, permitindo que os participantes compartilhem fotos, mensagens e votos de forma intuitiva e visual.

[![Backend](https://img.shields.io/badge/Backend-.NET%209.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com)
[![Frontend](https://img.shields.io/badge/Frontend-Angular%2019-DD0031?style=for-the-badge&logo=angular)](https://angular.io)
[![Deploy Backend](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)
[![Deploy Frontend](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [API Endpoints](#-api-endpoints)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Deploy](#-deploy)
- [Modelos de Dados](#-modelos-de-dados)
- [Créditos](#-créditos)

---

## 🌟 Sobre o Projeto

O **Memuvie** transforma eventos especiais — como chás de revelação, aniversários, casamentos e formaturas — em experiências digitais compartilháveis e duradouras.

A plataforma permite que o organizador de um evento crie um espaço online onde os convidados possam:

- 📸 Publicar fotos e mensagens na galeria do evento
- 🎉 Acompanhar em tempo real as postagens dos outros convidados
- 💌 Receber e enviar mensagens especiais para os organizadores

Ideal para **chás de revelação**, **aniversários**, **casamentos**, **formaturas** e qualquer ocasião especial que você queira guardar para sempre.

---

## ✨ Funcionalidades

### Para Organizadores (Admin)
- ✅ Criar e gerenciar eventos com foto de capa, vídeo destaque e cor do tema
- ✅ Controlar a votação: abrir, encerrar e revelar o resultado
- ✅ Gerenciar usuários convidados
- ✅ Visualizar todas as postagens da galeria

### Para Convidados
- ✅ Registrar-se e fazer login com JWT
- ✅ Publicar posts na galeria com foto e mensagem
- ✅ Visualizar a galeria completa do evento
- ✅ Redefinir senha via e-mail

### Geral
- ✅ Autenticação stateless com JWT (validade de 24h)
- ✅ Upload de mídias via Cloudinary (imagens e vídeos)
- ✅ Envio de e-mails transacionais (redefinição de senha)
- ✅ Documentação automática da API via Swagger/OpenAPI
- ✅ Suporte a múltiplos tipos de evento: `ChaRevelacao`, `Aniversario`, `Casamento`, `Formatura`, `Outro`

---

## 🏛️ Arquitetura

O projeto é uma aplicação **full stack** dividida em dois serviços independentes:

```
memuvie/
├── backend/   → API REST em ASP.NET Core 9.0 (C#)
└── frontend/  → SPA em Angular 19 com SSR
```

### Backend — Clean Architecture

```
Controllers  →  Services  →  Repositories  →  DbContext (EF Core)
                    ↓
              Models / DTOs / Exceptions
```

- **Controllers**: Recebem as requisições HTTP e delegam para os serviços
- **Services**: Contêm a lógica de negócio isolada e testável
- **Repositories**: Abstração da camada de dados com padrão Repository
- **Models**: Entidades de domínio (Usuario, Evento, Voto, GaleriaPost)
- **DTOs**: Objetos de transferência de dados para requisições e respostas
- **Exceptions**: Exceções customizadas (`BusinessException`, `ResourceNotFoundException`, `UnauthorizedException`)
- **Middleware**: `GlobalExceptionMiddleware` para tratamento centralizado de erros

### Banco de Dados por Ambiente

| Ambiente | Banco de Dados |
|----------|----------------|
| Development | SQLite (arquivo `evento.db`) |
| Homolog | PostgreSQL (Neon) |
| Production | PostgreSQL |

---

## 💻 Tecnologias

### Backend

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Framework | ASP.NET Core | 9.0 |
| Linguagem | C# | 13 |
| ORM | Entity Framework Core | 9.0 |
| Banco (dev) | SQLite | — |
| Banco (prod) | PostgreSQL | 15+ |
| Autenticação | JWT Bearer | 9.0 |
| Hash de Senha | BCrypt.Net-Next | 4.0.3 |
| Mapeamento | AutoMapper | 12.0.1 |
| Validação | FluentValidation | 11.9.2 |
| Logging | Serilog | 8.0.1 |
| Storage | Cloudinary SDK | 1.28.0 |
| E-mail | MailKit | 4.9.0 |
| Documentação | Swashbuckle (Swagger) | 6.5.0 |
| Containerização | Docker | — |

### Frontend

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Framework | Angular | 19.1.0 |
| Linguagem | TypeScript | 5.7 |
| SSR | Angular SSR | 19.1.5 |
| Reatividade | RxJS | 7.8.0 |
| Build | Angular CLI | 19.1.5 |

### DevOps & Infraestrutura

| Serviço | Finalidade |
|---------|-----------|
| Render | Deploy do backend (Docker) |
| Vercel | Deploy do frontend |
| Cloudinary | Armazenamento de imagens e vídeos |
| PostgreSQL (Neon) | Banco de dados em produção/homolog |
| GitHub | Controle de versão |

---

## 📁 Estrutura do Repositório

```
memuvie/
├── memuvie.sln                        # Solução .NET
├── render.yaml                        # Configuração de deploy no Render
├── README.md                          # Este arquivo
│
├── backend/                           # API REST ASP.NET Core 9.0
│   ├── EventoAPI.csproj               # Arquivo de projeto .NET
│   ├── Program.cs                     # Ponto de entrada e configuração do app
│   ├── MappingProfile.cs              # Perfis do AutoMapper
│   ├── appsettings.json               # Configurações (desenvolvimento)
│   ├── appsettings.Homolog.json       # Configurações de homologação
│   ├── appsettings.Production.json    # Configurações de produção
│   ├── Dockerfile                     # Imagem Docker do backend
│   ├── docker-compose.yml             # Orquestração local com PostgreSQL
│   ├── global.json                    # Versão do SDK .NET
│   ├── src/
│   │   ├── Controllers/               # AuthController, EventoController,
│   │   │                              #   GaleriaController, MediaController,
│   │   │                              #   UsuarioController
│   │   ├── Services/                  # EventoService, UsuarioService, VotoService,
│   │   │                              #   GaleriaService, CloudinaryService, EmailService
│   │   ├── Models/                    # Usuario, Evento, Voto, GaleriaPost,
│   │   │                              #   TokenRedefinicaoSenha
│   │   ├── DTOs/
│   │   │   ├── Requests/              # DTOs de entrada
│   │   │   └── Responses/             # DTOs de saída
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs        # DbContext do EF Core
│   │   │   ├── DatabaseSeeder.cs      # Seed inicial de dados
│   │   │   └── Repositories/          # Implementações do padrão Repository
│   │   ├── Security/                  # JwtTokenService, PasswordHashService
│   │   ├── Exceptions/                # BusinessException, ResourceNotFoundException,
│   │   │                              #   UnauthorizedException
│   │   ├── Middleware/                # GlobalExceptionMiddleware
│   │   ├── Config/                    # MailSettings
│   │   └── Templates/                # Templates HTML de e-mail
│   └── Migrations/                   # Migrações do Entity Framework Core
│
└── frontend/                          # SPA Angular 19 com SSR
    ├── angular.json                   # Configuração do Angular CLI
    ├── package.json                   # Dependências npm
    ├── tsconfig.json                  # Configuração TypeScript
    ├── proxy.conf.json                # Proxy reverso para desenvolvimento
    ├── vercel.json                    # Configuração de deploy na Vercel
    └── src/
        ├── main.ts                    # Bootstrap do Angular
        ├── main.server.ts             # Bootstrap do SSR
        ├── server.ts                  # Servidor Express para SSR
        ├── environments/              # Configurações por ambiente (dev/prod)
        └── app/                       # Componentes, serviços e rotas
```

---

## 📌 Pré-requisitos

### Para rodar o backend localmente
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- Git

> O banco de dados em desenvolvimento é **SQLite** — não é necessário instalar nada extra.

### Para rodar o frontend localmente
- [Node.js 18+](https://nodejs.org/)
- npm 10+

### Opcional (PostgreSQL local ou Docker)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- PostgreSQL 15+

---

## 🔧 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/memuvie.git
cd memuvie
```

### 2. Configuração do Backend

```bash
cd backend

# Restaurar dependências
dotnet restore

# Aplicar migrações (cria o banco SQLite automaticamente em desenvolvimento)
dotnet ef database update
```

#### Variáveis de Ambiente (opcional para desenvolvimento)

Em desenvolvimento, os padrões já funcionam sem variáveis extras (SQLite local).
Para customizar, configure no sistema operacional ou via `dotnet user-secrets`:

```env
JWT_SECRET=sua_chave_secreta_minimo_32_caracteres

CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=seu@email.com
MAIL_PASSWORD=sua_senha_de_app
MAIL_FROM=seu@email.com

FRONTEND_URL=http://localhost:4200
```

### 3. Configuração do Frontend

```bash
cd frontend
npm install
```

---

## 🚀 Executando o Projeto

### Backend

```bash
cd backend

# Modo desenvolvimento com hot reload
dotnet watch run

# Ou sem hot reload
dotnet run
```

Disponível em:
- **API:** `http://localhost:5000`
- **Swagger UI:** `http://localhost:5000/swagger`

### Frontend

```bash
cd frontend

# Servidor de desenvolvimento (proxy aponta /api/** para localhost:5000)
npm start
```

Disponível em: **`http://localhost:4200`**

### Com Docker Compose (Backend + PostgreSQL local)

```bash
cd backend
docker-compose up --build
```

---

## 📡 API Endpoints

A documentação interativa completa está em `http://localhost:5000/swagger`.

### Autenticação — `/auth`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/registrar` | Registrar novo usuário | ❌ |
| POST | `/auth/login` | Login e obtenção do JWT | ❌ |
| POST | `/auth/solicitar-redefinicao-senha` | Solicitar redefinição de senha por e-mail | ❌ |
| POST | `/auth/redefinir-senha` | Redefinir senha com token | ❌ |

**Exemplo de login:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@exemplo.com", "senha": "senha123"}'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "tipo": "Convidado"
  }
}
```

### Usuários — `/usuarios`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/usuarios` | Listar todos os usuários | Admin |
| GET | `/usuarios/me` | Dados do usuário autenticado | ✅ |
| GET | `/usuarios/{id}` | Buscar usuário por ID | ✅ |
| PUT | `/usuarios/{id}` | Atualizar usuário | ✅ |
| PUT | `/usuarios/{id}/alterar-senha` | Alterar senha | ✅ |
| DELETE | `/usuarios/{id}` | Desativar usuário | Admin |

### Eventos — `/api/eventos`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/eventos` | Criar evento | ✅ |
| GET | `/api/eventos` | Listar todos os eventos | ❌ |
| GET | `/api/eventos/ativos` | Listar eventos ativos | ❌ |
| GET | `/api/eventos/votacao-aberta` | Listar eventos com votação aberta | ❌ |
| GET | `/api/eventos/meus-eventos` | Meus eventos | ✅ |
| GET | `/api/eventos/{id}` | Buscar evento por ID | ❌ |
| PUT | `/api/eventos/{id}` | Atualizar evento | ✅ |
| DELETE | `/api/eventos/{id}` | Deletar evento | ✅ |
| POST | `/api/eventos/{id}/revelar` | Revelar resultado | ✅ |

### Galeria — `/api/galeria`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/galeria` | Criar post na galeria | ✅ |
| GET | `/api/galeria` | Listar todos os posts | ❌ |
| GET | `/api/galeria/evento/{eventoId}` | Posts de um evento | ❌ |
| GET | `/api/galeria/meus-posts` | Meus posts | ✅ |
| GET | `/api/galeria/{id}` | Buscar post por ID | ❌ |
| PUT | `/api/galeria/{id}` | Atualizar post | ✅ |
| DELETE | `/api/galeria/{id}` | Deletar post | ✅ |

### Mídia — `/api/media`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/media/upload` | Upload de arquivo para o Cloudinary | ✅ |

Endpoints marcados com ✅ requerem o header:
```
Authorization: Bearer <seu_jwt_token>
```

---

## 🔐 Variáveis de Ambiente

### Backend

| Variável | Descrição | Padrão (dev) |
|----------|-----------|-------------|
| `JWT_SECRET` | Chave secreta para assinatura do JWT | valor interno (não usar em produção) |
| `DB_HOST` | Host do PostgreSQL (prod/homolog) | `postgres` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_NAME` | Nome do banco | `evento_prd_db` |
| `DB_USER` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `postgres` |
| `CLOUDINARY_CLOUD_NAME` | Nome do cloud no Cloudinary | `dvauwroyx` |
| `CLOUDINARY_API_KEY` | Chave da API do Cloudinary | — |
| `CLOUDINARY_API_SECRET` | Segredo da API do Cloudinary | — |
| `MAIL_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `MAIL_USERNAME` | Usuário do e-mail | — |
| `MAIL_PASSWORD` | Senha do e-mail (senha de app) | — |
| `MAIL_FROM` | Endereço de remetente | — |
| `FRONTEND_URL` | URL do frontend (para links nos e-mails) | `http://localhost:4200` |

> **Provedores de e-mail suportados:** Gmail, Outlook, Hotmail e iCloud (todos via SMTP + STARTTLS na porta 587).

---

## 🚢 Deploy

### Backend — Render (Docker)

O backend é containerizado e deployado automaticamente no **Render** via `render.yaml` na raiz do repositório.

```bash
# Build manual da imagem
cd backend
docker build -t memuvie-backend .

# Publicar para produção manualmente
dotnet publish -c Release -o ./publish
```

### Frontend — Vercel

O frontend é deployado automaticamente na **Vercel** a cada push na branch principal. Configuração de rotas SPA em `frontend/vercel.json`.

```bash
# Build manual
cd frontend
npm run build:prod
# Saída: dist/cha-revelacao/browser/
```

### URLs dos Ambientes

| Ambiente | Backend | Frontend |
|----------|---------|---------|
| Development | `http://localhost:5000` | `http://localhost:4200` |
| Homolog | Render (Homolog) | — |
| Production | `https://memuvie.onrender.com` | `https://memuvie.vercel.app` |

---

## 📐 Modelos de Dados

### Usuario

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Id` | long | Identificador único |
| `Nome` | string | Nome completo |
| `Email` | string | E-mail único |
| `Senha` | string | Hash BCrypt |
| `FotoPerfil` | string? | URL da foto de perfil |
| `Tipo` | enum | `Admin` (0) ou `Convidado` (1) |
| `Ativo` | bool | Se o usuário está ativo |
| `CriadoEm` | DateTime | Data de criação |

### Evento

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Id` | long | Identificador único |
| `Titulo` | string | Título do evento |
| `Descricao` | string? | Descrição do evento |
| `DataEvento` | DateTime | Data de realização |
| `Local` | string? | Local do evento |
| `NomeMae` / `NomePai` | string | Nomes dos responsáveis |
| `TipoEvento` | enum | `ChaRevelacao`, `Aniversario`, `Casamento`, `Formatura`, `Outro` |
| `Status` | enum | `Ativo`, `Cancelado`, `Finalizado` |
| `Revelado` | bool | Se o resultado foi revelado |
| `ResultadoRevelacao` | enum? | `Menino` (0) ou `Menina` (1) |
| `VotacaoEncerrada` | bool | Se a votação está encerrada |
| `FotoCapa` | string? | URL da foto de capa (Cloudinary) |
| `VideoDestaque` | string? | URL do vídeo destaque (Cloudinary) |
| `CorTema` | string? | Cor hexadecimal do tema |

### GaleriaPost

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Id` | long | Identificador único |
| `UsuarioId` | long | FK para Usuario |
| `EventoId` | long | FK para Evento |
| `Mensagem` | string? | Mensagem do post |
| `MidiaUrl` | string? | URL da mídia (Cloudinary) |
| `CriadoEm` | DateTime | Data do post |

---

## 👥 Créditos

### Equipe Memuvie

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/rhayssakramer">
        <img src="https://github.com/rhayssakramer.png" width="80px" alt="Rhayssa Kramer"/>
        <br />
        <sub><b>Rhayssa Kramer</b></sub>
      </a>
      <br />
      <small>Tech Lead & Full Stack Developer</small>
    </td>
    <td align="center">
      <a href="https://github.com/italorochaj">
        <img src="https://avatars.githubusercontent.com/u/102812593?v=4" width="80px" alt="Italo Rocha"/>
        <br />
        <sub><b>Italo Rocha</b></sub>
      </a>
      <br />
      <small>Product Development</small>
    </td>
  </tr>
</table>

---

<div align="center">
  <p>Feito com 💜 pela equipe Memuvie</p>
  <p><strong>Viva agora, reviva sempre.</strong></p>
  <sub>© 2025 Memuvie. Todos os direitos reservados.</sub>
</div>