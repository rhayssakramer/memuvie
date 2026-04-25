# 🎉 Memuvie — Backend

API REST moderna e escalável desenvolvida em **ASP.NET Core 9.0** com **C# 13** para a plataforma **Memuvie** de memórias digitais. Backend completo com autenticação JWT, padrões SOLID, Clean Architecture e boas práticas de desenvolvimento profissional.

**Status:** ✅ Pronto para produção | **Versão:** 1.0.0 | **Licença:** MIT

---

## 📑 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura](#-arquitetura)
3. [Estrutura do Projeto](#-estrutura-do-projeto)
4. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
5. [Pré-requisitos](#-pré-requisitos)
6. [Instalação e Configuração](#-instalação-e-configuração)
7. [Configuração de Ambiente](#-configuração-de-ambiente)
8. [Banco de Dados](#-banco-de-dados)
9. [Execução](#-execução)
10. [API REST - Endpoints](#-api-rest---endpoints)
11. [Autenticação e Segurança](#-autenticação-e-segurança)
12. [Serviços Principais](#-serviços-principais)
13. [Modelos de Dados](#-modelos-de-dados)
14. [Tratamento de Erros](#-tratamento-de-erros)
15. [Documentação Swagger](#-documentação-swagger)
16. [Docker e Containerização](#-docker-e-containerização)
17. [Deployment](#-deployment)
18. [Troubleshooting](#-troubleshooting)
19. [Contribuindo](#-contribuindo)

---

## 🎯 Visão Geral

**Memuvie Backend** é a camada de servidor da plataforma Memuvie, responsável por:

- **Autenticação e Autorização** — Gerenciamento seguro de usuários com JWT
- **Gestão de Eventos** — CRUD completo de eventos (aniversários, casamentos, reuniões, etc.)
- **Sistema de Votos** — Enquetes e sondagens para interação do público
- **Galeria de Mídia** — Armazenamento e gerenciamento de imagens/vídeos (integrado com Cloudinary)
- **Envio de E-mails** — Sistema de notificações por email com templates HTML
- **Persistência de Dados** — Armazenamento robusto em PostgreSQL
- **Documentação da API** — Swagger/OpenAPI para fácil integração

---

## 🏛️ Arquitetura

A aplicação segue o padrão de **Clean Architecture** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│         API REST (Controllers)           │
│  (AuthController, EventoController...)   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Business Logic (Services)         │
│  (UsuarioService, EventoService...)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Data Access (Repositories)          │
│   (Entity Framework DbContext)           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Database (PostgreSQL)            │
│      (Entities, Migrations)              │
└──────────────────────────────────────────┘
```

**Fluxo de Requisição:**
1. Cliente envia HTTP Request → 2. Controller valida entrada → 3. Service executa lógica → 4. Repository acessa dados → 5. Response retorna com dados/status

---

## 🏗️ Estrutura do Projeto

```
backend/
├── 📁 src/                           # Código-fonte principal
│   ├── 📁 Controllers/               # Camada de apresentação
│   │   ├── AuthController.cs         # Autenticação (login/registro)
│   │   ├── UsuarioController.cs      # Gerenciamento de usuários
│   │   ├── EventoController.cs       # Gerenciamento de eventos
│   │   ├── VotoController.cs         # Sistema de votos/enquetes
│   │   ├── GaleriaController.cs      # Gerenciamento de galeria
│   │   └── MediaController.cs        # Upload de mídia
│   │
│   ├── 📁 Services/                  # Lógica de negócio
│   │   ├── UsuarioService.cs         # Usuários (register, login)
│   │   ├── EventoService.cs          # Eventos (CRUD)
│   │   ├── VotoService.cs            # Votos e enquetes
│   │   ├── GaleriaService.cs         # Galeria (CRUD)
│   │   ├── EmailService.cs           # Envio de emails
│   │   ├── CloudinaryService.cs      # Integração com Cloudinary
│   │   └── JwtTokenService.cs        # Geração de tokens JWT
│   │
│   ├── 📁 Models/                    # Entidades do domínio
│   │   ├── Usuario.cs                # Usuário (id, email, senha, perfil)
│   │   ├── Evento.cs                 # Evento (nome, data, descrição)
│   │   ├── Voto.cs                   # Voto (resposta, usuário, evento)
│   │   ├── GaleriaPost.cs            # Post da galeria (imagem/vídeo)
│   │   └── TokenRedefinicaoSenha.cs  # Token para reset de senha
│   │
│   ├── 📁 DTOs/                      # Data Transfer Objects
│   │   ├── 📁 Requests/              # DTOs de entrada
│   │   │   ├── RegistrarDTO.cs
│   │   │   ├── LoginDTO.cs
│   │   │   ├── CriarEventoDTO.cs
│   │   │   ├── CriarVotoDTO.cs
│   │   │   └── ...
│   │   │
│   │   └── 📁 Responses/             # DTOs de saída
│   │       ├── UsuarioDTO.cs
│   │       ├── EventoDTO.cs
│   │       ├── VotoDTO.cs
│   │       └── ...
│   │
│   ├── 📁 Data/                      # Camada de persistência
│   │   ├── AppDbContext.cs           # DbContext (EF Core)
│   │   ├── DatabaseSeeder.cs         # Dados iniciais
│   │   └── 📁 Repositories/          # Padrão Repository (abstração de acesso a dados)
│   │
│   ├── 📁 Security/                  # Segurança
│   │   ├── JwtTokenService.cs        # Geração/validação JWT
│   │   └── PasswordHashService.cs    # Hash e verificação de senhas
│   │
│   ├── 📁 Exceptions/                # Exceções customizadas
│   │   ├── BusinessException.cs
│   │   ├── ResourceNotFoundException.cs
│   │   └── UnauthorizedException.cs
│   │
│   ├── 📁 Middleware/                # Processamento de requisições
│   │   └── GlobalExceptionMiddleware.cs  # Tratamento de exceções global
│   │
│   ├── 📁 Config/                    # Configurações
│   │   └── MailSettings.cs           # Configuração de email
│   │
│   ├── 📁 Templates/                 # Templates de email
│   │   └── redefinicao-senha.html    # Email de reset de senha
│   │
│   └── MappingProfile.cs             # Mapeamento de objetos (AutoMapper)
│
├── 📁 Migrations/                    # Migrações do Entity Framework
│   ├── 20260410200444_InitialCreate.cs
│   ├── 20260425000000_FixBooleanColumnsForPostgres.cs
│   └── ...
│
├── 📁 Properties/                    # Configurações do projeto
│   └── launchSettings.json
│
├── 📁 bin/                           # Artifacts compilados
├── 📁 obj/                           # Objetos compilados
│
├── 📄 Program.cs                     # Ponto de entrada e DI setup
├── 📄 EventoAPI.csproj               # Arquivo de projeto .NET
├── 📄 global.json                    # Versão do SDK .NET
├── 📄 appsettings.json               # Configurações padrão
├── 📄 appsettings.Homolog.json       # Configurações homolog
├── 📄 appsettings.Production.json    # Configurações produção
├── 📄 NuGet.config                   # Configuração NuGet
├── 📄 Dockerfile                     # Container Docker
├── 📄 docker-compose.yml             # Orquestração Docker
└── 📄 README.md                      # Este arquivo
```

---

## 💻 Tecnologias Utilizadas

### Core Framework
| Pacote | Versão | Descrição |
|--------|--------|-----------|
| **ASP.NET Core** | 9.0 | Framework web moderno e de alto desempenho |
| **C#** | 13 | Linguagem de programação |
| **Entity Framework Core** | 9.0 | ORM para acesso a dados |

### Banco de Dados
| Pacote | Versão | Descrição |
|--------|--------|-----------|
| **Npgsql** | 8.0.3 | Driver PostgreSQL |
| **PostgreSQL** | 15+ | Banco de dados relacional (produção) |
| **SQLite** | - | Banco de dados (desenvolvimento) |

### Segurança & Autenticação
| Pacote | Versão | Descrição |
|--------|--------|-----------|
| **Microsoft.AspNetCore.Authentication.JwtBearer** | 9.0 | Autenticação JWT |
| **System.IdentityModel.Tokens.Jwt** | 8.1.0 | Manipulação de tokens JWT |
| **BCrypt.Net-Next** | 4.0.3 | Hash de senha seguro |

### Utilitários
| Pacote | Versão | Descrição |
|--------|--------|-----------|
| **AutoMapper** | 13.0.1 | Mapeamento de objetos |
| **FluentValidation** | 11.9.2 | Validação de entrada |
| **Serilog** | 8.0.1 | Logging estruturado |
| **MailKit** | 4.9.0 | Envio de emails via SMTP |
| **CloudinaryDotNet** | 1.28.0 | Integração Cloudinary |
| **Swashbuckle** | 6.5.0 | Documentação Swagger/OpenAPI |
| **CSharpier** | 0.29.1 | Formatação de código C# |

---

## 📋 Pré-requisitos

### Obrigatório
- **[.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)** ou superior
- **PostgreSQL 15+** (ou SQLite para desenvolvimento)
- **Git** para controle de versão

### Opcional (Recomendado)
- **Docker & Docker Compose** — Para containerização
- **Postman** ou **Insomnia** — Para testar endpoints
- **Visual Studio Code** ou **Visual Studio 2022** — IDE

### Verificar Instalação
```bash
# Verificar .NET
dotnet --version

# Verificar PostgreSQL (se instalado)
psql --version
```

---

## 🔧 Instalação e Configuração

### 1️⃣ Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/memuvie.git
cd memuvie/backend
```

### 2️⃣ Restaurar Dependências

```bash
# Restaurar pacotes NuGet
dotnet restore

# Verificar dependências instaladas
dotnet list package
```

### 3️⃣ Configurar Banco de Dados

```bash
# Aplicar migrações (cria/atualiza schema)
dotnet ef database update

# Listar migrações aplicadas
dotnet ef migrations list
```

### 4️⃣ Build do Projeto

```bash
# Compilar o projeto
dotnet build

# Build em modo Release (otimizado)
dotnet build --configuration Release
```

---

## 🌍 Configuração de Ambiente

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto ou configure as variáveis no sistema:

```bash
# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/memuvie
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=memuvie
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui_minimo_32_caracteres
JWT_EXPIRATION_HOURS=24

# Email (Gmail/Outlook)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_FROM=seu-email@gmail.com
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua_senha_app_aqui
MAIL_FROM_NAME=Memuvie

# Cloudinary (Mídia)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

# Ambiente
ASPNETCORE_ENVIRONMENT=Development  # Development, Staging, Production
ASPNETCORE_URLS=http://localhost:5000

# Segurança
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://seu-frontend.vercel.app

# Logging
LOG_LEVEL=Information  # Debug, Information, Warning, Error, Critical
```

### Configurar no appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=memuvie;Username=postgres;Password=sua_senha;"
  },
  "Jwt": {
    "SecretKey": "sua_chave_secreta_super_segura_aqui_minimo_32_caracteres",
    "ExpirationHours": 24,
    "Issuer": "memuvie-api",
    "Audience": "memuvie-app"
  },
  "MailSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "From": "seu-email@gmail.com",
    "Username": "seu-email@gmail.com",
    "Password": "sua_senha_app_aqui",
    "FromName": "Memuvie"
  },
  "Cloudinary": {
    "CloudName": "seu_cloud_name",
    "ApiKey": "sua_api_key",
    "ApiSecret": "sua_api_secret"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000", "https://seu-frontend.vercel.app"]
  }
}
```

---

## 🗄️ Banco de Dados

### Conectar via CLI

```bash
# Conectar ao PostgreSQL (linux/mac)
psql -U postgres -h localhost -d memuvie

# Conectar ao PostgreSQL (windows)
psql -U postgres -h localhost -d memuvie
```

### Criar Banco de Dados Manualmente

```sql
-- Conectar como superuser
psql -U postgres

-- Criar banco
CREATE DATABASE memuvie;

-- Criar usuário
CREATE USER memuvie_user WITH PASSWORD 'seu_password_seguro';

-- Dar permissões
ALTER ROLE memuvie_user SET client_encoding TO 'utf8';
ALTER ROLE memuvie_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE memuvie_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE memuvie TO memuvie_user;

-- Conectar ao novo banco
\c memuvie

-- Dar permissões no schema público
GRANT ALL PRIVILEGES ON SCHEMA public TO memuvie_user;

-- Sair
\q
```

### Migrações Entity Framework

```bash
# Listar migrações
dotnet ef migrations list

# Adicionar nova migração (após mudanças nos Models)
dotnet ef migrations add <NomeMigracao>

# Remover última migração (se não aplicada)
dotnet ef migrations remove

# Aplicar migrações (criar/atualizar schema)
dotnet ef database update

# Reverter para migração anterior
dotnet ef database update <NomeMigracaoAnterior>

# Remover banco de dados
dotnet ef database drop
```

---

## ▶️ Execução

### Executar em Desenvolvimento

```bash
# Modo desenvolvimento (com reload automático)
dotnet watch run

# Ou simplesmente:
dotnet run

# Especificar porta
dotnet run -- --urls "http://localhost:5000"

# Modo Release (otimizado)
dotnet run --configuration Release
```

### Saída Esperada

```
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to exit.
```

### Testar a API

```bash
# Verificar se a API está rodando
curl http://localhost:5000/health

# Acessar Swagger
# Navegador: http://localhost:5000/swagger
```

---

## 🔌 API REST - Endpoints

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/api/auth/registrar` | Registrar novo usuário | ❌ Pública |
| `POST` | `/api/auth/login` | Fazer login | ❌ Pública |
| `POST` | `/api/auth/refresh-token` | Renovar token JWT | ⚠️ Token |
| `POST` | `/api/auth/esqueci-senha` | Solicitar reset de senha | ❌ Pública |
| `POST` | `/api/auth/redefinir-senha` | Redefinir senha com token | ❌ Pública |

### Usuários (`/api/usuarios`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/usuarios/{id}` | Obter dados do usuário | ✅ Requerida |
| `PUT` | `/api/usuarios/{id}` | Atualizar perfil | ✅ Requerida |
| `DELETE` | `/api/usuarios/{id}` | Deletar conta | ✅ Requerida |
| `GET` | `/api/usuarios/{id}/eventos` | Listar eventos do usuário | ✅ Requerida |

### Eventos (`/api/eventos`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/eventos` | Listar todos os eventos | ✅ Requerida |
| `GET` | `/api/eventos/{id}` | Obter detalhes de evento | ✅ Requerida |
| `POST` | `/api/eventos` | Criar novo evento | ✅ Requerida |
| `PUT` | `/api/eventos/{id}` | Atualizar evento | ✅ Requerida |
| `DELETE` | `/api/eventos/{id}` | Deletar evento | ✅ Requerida |
| `GET` | `/api/eventos/{id}/convidados` | Listar convidados | ✅ Requerida |

### Votos/Enquetes (`/api/votos`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/votos/evento/{eventoId}` | Listar votos de um evento | ✅ Requerida |
| `POST` | `/api/votos` | Criar novo voto | ✅ Requerida |
| `GET` | `/api/votos/{id}` | Obter detalhes do voto | ✅ Requerida |
| `DELETE` | `/api/votos/{id}` | Deletar voto | ✅ Requerida |

### Galeria (`/api/galeria`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/galeria/evento/{eventoId}` | Listar fotos de evento | ✅ Requerida |
| `POST` | `/api/galeria` | Upload de imagem | ✅ Requerida |
| `DELETE` | `/api/galeria/{id}` | Deletar foto | ✅ Requerida |
| `PUT` | `/api/galeria/{id}` | Atualizar foto (descrição) | ✅ Requerida |

### Mídia (`/api/media`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/api/media/upload` | Upload de arquivo | ✅ Requerida |
| `DELETE` | `/api/media/{publicId}` | Deletar arquivo | ✅ Requerida |

---

## 🔐 Autenticação e Segurança

### Fluxo de Autenticação JWT

```
1. Cliente faz login (email + senha)
   ↓
2. Backend valida credenciais
   ↓
3. Backend gera JWT Token (válido 24h)
   ↓
4. Cliente armazena token (localStorage/sessionStorage)
   ↓
5. Cliente envia token em Authorization header
   ↓
6. Backend valida token e autoriza acesso
```

### Headers de Autenticação

```bash
# Formato correto do header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Exemplo com curl
curl -H "Authorization: Bearer TOKEN_AQUI" http://localhost:5000/api/usuarios/123
```

### Exemplo de Payload JWT

```json
{
  "sub": "usuario-id-123",
  "email": "usuario@email.com",
  "name": "João Silva",
  "iat": 1234567890,
  "exp": 1234654290  // Expira em 24 horas
}
```

### Segurança de Senha

- Senhas são hashadas com **BCrypt** (algoritmo PBKDF2 com salt automático)
- Nunca são armazenadas em texto plano
- Validação mínima: 8 caracteres

### CORS (Cross-Origin Resource Sharing)

Configure as origens permitidas em `appsettings.json`:

```json
"Cors": {
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://seu-frontend.vercel.app"
  ]
}
```

---

## 🛠️ Serviços Principais

### 1. UsuarioService
Gerencia registro, login, atualização de perfil:
- `RegistrarAsync()` — Cria novo usuário
- `LoginAsync()` — Valida credenciais e retorna token
- `AtualizarPerfilAsync()` — Atualiza dados do usuário

### 2. EventoService
CRUD completo de eventos:
- `CriarEventoAsync()` — Cria novo evento
- `ListarEventosAsync()` — Lista eventos do usuário
- `ObtenerEventoAsync()` — Busca evento por ID
- `AtualizarEventoAsync()` — Atualiza dados do evento
- `DeletarEventoAsync()` — Deleta evento

### 3. VotoService
Gerencia enquetes/votos:
- `CriarVotoAsync()` — Registra novo voto
- `ListarVotosAsync()` — Lista votos de um evento
- `ObterResultadosVotosAsync()` — Calcula resultados

### 4. GaleriaService
Gerencia fotos/vídeos:
- `CriarPostAsync()` — Adiciona foto à galeria
- `ListarPostsAsync()` — Lista mídia do evento
- `DeletarPostAsync()` — Remove foto

### 5. CloudinaryService
Integração com Cloudinary para armazenamento:
- `UploadAsync()` — Upload de arquivo
- `DeletarAsync()` — Delete de arquivo
- `ObterUrlOtimizadaAsync()` — Retorna URL com transformações

### 6. EmailService
Envio de notificações por email:
- `EnviarAsync()` — Envia email
- `EnviarTemplateAsync()` — Envia email com template HTML

### 7. JwtTokenService
Geração e validação de tokens JWT:
- `GerarTokenAsync()` — Cria novo token
- `ValidarTokenAsync()` — Valida token
- `ObterClaimsAsync()` — Extrai informações do token

---

## 📊 Modelos de Dados

### Usuario
```csharp
public class Usuario
{
    public Guid Id { get; set; }
    public string Email { get; set; }          // Único
    public string Senha { get; set; }          // Hash BCrypt
    public string Nome { get; set; }
    public string Sobrenome { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime? DataAtualizacao { get; set; }
    
    // Relacionamentos
    public ICollection<Evento> Eventos { get; set; }
    public ICollection<Voto> Votos { get; set; }
}
```

### Evento
```csharp
public class Evento
{
    public Guid Id { get; set; }
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public DateTime Data { get; set; }
    public string Local { get; set; }
    public TipoEvento Tipo { get; set; }     // Aniversario, Casamento, etc
    public Guid UsuarioOrganizadorId { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime? DataAtualizacao { get; set; }
    
    // Relacionamentos
    public Usuario UsuarioOrganizador { get; set; }
    public ICollection<Voto> Votos { get; set; }
    public ICollection<GaleriaPost> GaleriaPosts { get; set; }
}
```

### Voto
```csharp
public class Voto
{
    public Guid Id { get; set; }
    public Guid EventoId { get; set; }
    public Guid UsuarioId { get; set; }
    public string Resposta { get; set; }      // Opção selecionada
    public DateTime DataCriacao { get; set; }
    
    // Relacionamentos
    public Evento Evento { get; set; }
    public Usuario Usuario { get; set; }
}
```

### GaleriaPost
```csharp
public class GaleriaPost
{
    public Guid Id { get; set; }
    public Guid EventoId { get; set; }
    public string Titulo { get; set; }
    public string UrlFoto { get; set; }       // URL Cloudinary
    public string Descricao { get; set; }
    public DateTime DataCriacao { get; set; }
    
    // Relacionamentos
    public Evento Evento { get; set; }
}
```

---

## ⚠️ Tratamento de Erros

### Padrão de Resposta de Erro

```json
{
  "success": false,
  "message": "Erro ao processar requisição",
  "errors": [
    {
      "field": "email",
      "message": "Email já está cadastrado"
    }
  ],
  "statusCode": 400,
  "timestamp": "2025-04-25T10:30:00Z"
}
```

### Códigos HTTP

| Código | Significado | Exemplo |
|--------|-----------|---------|
| `200` | OK | Requisição bem-sucedida |
| `201` | Created | Recurso criado com sucesso |
| `400` | Bad Request | Dados inválidos |
| `401` | Unauthorized | Token inválido/expirado |
| `403` | Forbidden | Sem permissão |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Email já existe |
| `500` | Server Error | Erro no servidor |

### Exceções Customizadas

```csharp
// BusinessException — Erro de negócio
throw new BusinessException("Evento não pode estar no passado");

// ResourceNotFoundException — Recurso não encontrado
throw new ResourceNotFoundException($"Evento {id} não encontrado");

// UnauthorizedException — Sem permissão
throw new UnauthorizedException("Acesso negado a este evento");
```

---

## 📚 Documentação Swagger

A API possui documentação interativa via Swagger/OpenAPI.

### Acessar Swagger

- **Desenvolvimento:** http://localhost:5000/swagger
- **Produção:** https://api.memuvie.com/swagger

### Testar Endpoints no Swagger

1. Acesse `/swagger`
2. Clique no botão **"Authorize"**
3. Insira o token JWT: `Bearer SEU_TOKEN_AQUI`
4. Clique em qualquer endpoint para expandir
5. Clique **"Try it out"**
6. Preencha os parâmetros
7. Clique **"Execute"**

---

## 🐳 Docker e Containerização

### Build da Imagem Docker

```bash
# Build local
docker build -t memuvie-backend:latest .

# Tag para registro
docker tag memuvie-backend:latest seu-registry/memuvie-backend:latest
```

### Executar Container

```bash
# Executar com docker-compose
docker-compose up -d

# Executar container individual
docker run -p 5000:5000 \
  -e DATABASE_HOST=db \
  -e ASPNETCORE_ENVIRONMENT=Development \
  memuvie-backend:latest

# Ver logs
docker logs -f memuvie-backend

# Parar container
docker stop memuvie-backend
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: memuvie
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: sua_senha
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      DATABASE_HOST: db
      ASPNETCORE_ENVIRONMENT: Development
    depends_on:
      - db

volumes:
  db-data:
```

---

## 🚀 Deployment

### Render (Backend)

1. **Conectar Repositório**
   - Acesse [render.com](https://render.com)
   - Clique "New +"
   - Selecione "Web Service"
   - Conecte seu repositório GitHub

2. **Configurar Serviço**
   ```
   Name: memuvie-backend
   Environment: Docker
   Region: Ohio (EUA)
   Branch: main
   ```

3. **Configurar Variáveis de Ambiente**
   ```
   DATABASE_URL = postgresql://user:pass@db.com/memuvie
   JWT_SECRET = sua_chave_secreta_aqui
   ASPNETCORE_ENVIRONMENT = Production
   CORS_ALLOWED_ORIGINS = https://seu-frontend.vercel.app
   ```

4. **Deploy**
   - Clique "Create Web Service"
   - Aguarde build e deployment
   - URL será gerada automaticamente

### Build e Deploy Local

```bash
# Publicar em Release
dotnet publish -c Release -o ./publish

# Comprimir
Compress-Archive -Path ./publish -DestinationPath memuvie-backend.zip

# Deploy (copiar para servidor via SCP/SFTP)
# scp memuvie-backend.zip usuario@seu-servidor:/var/www/
```

---

## 🔧 Troubleshooting

### ❌ Erro: "Connection refused" (Banco de Dados)

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Iniciar PostgreSQL
sudo service postgresql start

# Verificar credenciais em appsettings.json
# Confirmar que DATABASE_HOST, USER, PASSWORD estão corretos
```

### ❌ Erro: "JWT Token expired"

**Solução:**
```bash
# O token expirou (24 horas)
# Faça login novamente para obter novo token
POST /api/auth/login
```

### ❌ Erro: "CORS policy: blocked"

**Solução:**
```bash
# Adicione origem do frontend em appsettings.json
"Cors": {
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://seu-frontend.vercel.app"
  ]
}
```

### ❌ Erro: "Migration pending"

**Solução:**
```bash
# Aplicar migrações
dotnet ef database update

# Se problema persistir, recrie o banco:
dotnet ef database drop
dotnet ef database update
```

### ❌ Erro: "Port 5000 already in use"

**Solução:**
```bash
# Windows - Encontrar processo na porta
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Ou usar porta diferente
dotnet run -- --urls "http://localhost:5001"
```

### ❌ Cloudinary uploads falhando

**Solução:**
```bash
# Verificar credenciais em appsettings.json
"Cloudinary": {
  "CloudName": "seu_cloud_name",
  "ApiKey": "sua_api_key",
  "ApiSecret": "sua_api_secret"
}

# Testar credenciais no dashboard Cloudinary
```

### ✅ Verificar Saúde da API

```bash
# Health check (sem autenticação)
curl http://localhost:5000/health

# Response esperado
{"status":"healthy","timestamp":"2025-04-25T10:30:00Z"}
```

---

## 👥 Contribuindo

Ao contribuir para o backend, siga estas guidelines:

1. **Fork** o repositório
2. Crie uma **branch** para sua feature: `git checkout -b feature/minha-feature`
3. **Commit** suas mudanças: `git commit -m "Add: descrição da mudança"`
4. **Push** para a branch: `git push origin feature/minha-feature`
5. Abra um **Pull Request**

### Padrões de Código

- Siga convenções **C# e .NET**
- Use **PascalCase** para nomes de classes e métodos
- Use **camelCase** para variáveis locais
- Adicione **comentários XML** para métodos públicos
- Use **async/await** para operações I/O
- Aplique **FluentValidation** para todas as DTOs

### Commit Message Format

```
feat: Adicionar novo endpoint de eventos
fix: Corrigir validação de email
docs: Atualizar documentação de autenticação
refactor: Reorganizar estrutura de serviços
test: Adicionar testes de integração
```

---

## 📄 Licença

Este projeto está sob licença **MIT**. Veja o arquivo [LICENSE](../../LICENSE) para mais detalhes.

---

## 📞 Suporte

- 📧 Email: suporte@memuvie.com
- 💬 Discord: [Comunidade Memuvie](https://discord.gg/memuvie)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/memuvie/issues)

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

---

**Última atualização:** 25 de Abril, 2025 | **Versão:** 1.0.0 | **Status:** ✅ Pronto para Produção