# 👦👧 Revelação Chá - Backend .NET

Backend da aplicação **Pedro ou Eduarda** desenvolvido em **ASP.NET Core 9.0 com C#**.

Esta é uma versão modernizada e limpa do backend original em Java, com uma arquitetura mais simples e estruturada para .NET.

## 📋 Índice

- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Execução](#-execução)
- [API Endpoints](#-api-endpoints)
- [Documentação da API](#-documentação-da-api)

## 🏗️ Estrutura do Projeto

```
backend2/
├── src/
│   ├── Controllers/          # Controladores da API
│   ├── Services/             # Serviços de negócio
│   ├── Models/               # Modelos de dados
│   ├── DTOs/                 # Data Transfer Objects
│   │   ├── Requests/         # DTOs de requisição
│   │   └── Responses/        # DTOs de resposta
│   ├── Data/                 # Camada de dados
│   │   ├── AppDbContext.cs   # Entity Framework DbContext
│   │   └── Repositories/     # Padrão Repository
│   ├── Security/             # Autenticação e segurança
│   ├── Exceptions/           # Exceções customizadas
│   └── Validators/           # Validações de negócio
├── Program.cs                # Configuração da aplicação
├── MappingProfile.cs         # AutoMapper profiles
├── RevelacaoCha.csproj       # Arquivo de projeto
├── appsettings.json          # Configurações
├── Dockerfile                # Docker image
└── docker-compose.yml        # Orquestração de containers
```

## 💻 Tecnologias Utilizadas

| Categoria | Tecnologia | Versão |
|-----------|-----------|---------|
| **Framework** | ASP.NET Core | 9.0 |
| **Linguagem** | C# | - |
| **Banco de Dados** | PostgreSQL | 15+ |
| **ORM** | Entity Framework Core | 9.0 |
| **Autenticação** | JWT (JSON Web Tokens) | - |
| **Hash de Senha** | BCrypt.Net-Next | 4.0.3 |
| **Mapeamento** | AutoMapper | 13.0.1 |
| **Validação** | FluentValidation | 11.9.2 |
| **Logging** | Serilog | 8.0.1 |
| **Documentação API** | Swagger/OpenAPI | 6.4.6 |
| **Containerização** | Docker & Docker Compose | - |

## 📋 Pré-requisitos

- **.NET 9.0 SDK** ou superior
- **PostgreSQL 15** ou superior
- **Docker** e **Docker Compose** (opcional, para containerização)
- **Git** para controle de versão

### Instalação de Dependências

#### Windows
```bash
# Instalar .NET 9.0
# Visite: https://dotnet.microsoft.com/download/dotnet/9.0

# Instalar PostgreSQL
# Visite: https://www.postgresql.org/download/windows/
```

#### Linux (Ubuntu/Debian)
```bash
# Instalar .NET 9.0
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --version 9.0

# Instalar PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

#### macOS
```bash
# Instalar com Homebrew
brew install dotnet postgresql
```

## 🔧 Instalação e Configuração

### 1. Clonar o repositório

```bash
cd memuvie
```

### 2. Restaurar dependências

```bash
dotnet restore
```

### 3. Configurar banco de dados

#### Opção A: Com PostgreSQL local

1. Criar banco de dados:
```sql
CREATE DATABASE revelacao_cha_db;
```

2. Atualizar string de conexão em `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=5432;Database=revelacao_cha_db;User Id=postgres;Password=postgres;"
}
```

3. Aplicar migrations:
```bash
dotnet ef database update
```

#### Opção B: Com Docker Compose

```bash
docker-compose up -d
```

O container PostgreSQL será criado automaticamente.

### 4. Configurar JWT Secret

No arquivo `appsettings.json`, altere a secret JWT:
```json
"Jwt": {
  "Secret": "sua-chave-super-segura-minimo-32-caracteres",
  "Expiration": 86400000
}
```

## 🚀 Execução

### Modo Desenvolvimento

```bash
# Executar com watch (recompila automaticamente)
dotnet watch run

# Ou simplesmente
dotnet run
```

A aplicação estará disponível em: `http://localhost:5000`

### Swagger/API Documentation

Acesse a documentação da API em: `http://localhost:5000/swagger`

### Com Docker

```bash
# Build e executar
docker-compose up --build

# Apenas executar (se já foi feito build)
docker-compose up

# Parar containers
docker-compose down
```

## 📡 API Endpoints

### Autenticação
- `POST /auth/registrar` - Registrar novo usuário
- `POST /auth/login` - Fazer login e obter JWT token

### Usuários
- `GET /usuarios` - Listar todos os usuários (Admin)
- `GET /usuarios/{id}` - Buscar usuário por ID
- `GET /usuarios/me` - Buscar usuário autenticado (Requer token)
- `PUT /usuarios/{id}` - Atualizar usuário
- `DELETE /usuarios/{id}` - Desativar usuário (Admin)
- `PUT /usuarios/{id}/alterar-senha` - Alterar senha (Requer token)

### Eventos
- `POST /api/eventos` - Criar novo evento (Requer token)
- `GET /api/eventos` - Listar todos os eventos
- `GET /api/eventos/ativos` - Listar eventos ativos
- `GET /api/eventos/votacao-aberta` - Listar eventos com votação aberta
- `GET /api/eventos/meus-eventos` - Listar eventos do usuário (Requer token)
- `GET /api/eventos/{id}` - Buscar evento por ID
- `PUT /api/eventos/{id}` - Atualizar evento (Requer token)
- `DELETE /api/eventos/{id}` - Deletar evento (Requer token)
- `POST /api/eventos/{id}/encerrar-votacao` - Encerrar votação
- `POST /api/eventos/{id}/revelar` - Revelar resultado

### Votos
- `POST /votos` - Votar em um evento (Requer token)
- `GET /votos` - Listar votos do usuário (Requer token)
- `GET /votos/evento/{eventoId}` - Listar votos de um evento
- `GET /votos/{id}` - Buscar voto por ID
- `GET /votos/evento/{eventoId}/meu-voto` - Buscar voto do usuário em um evento (Requer token)
- `PUT /votos/{id}` - Atualizar voto (Requer token)
- `DELETE /votos/{id}` - Deletar voto (Requer token)

### Galeria
- `POST /api/galeria` - Criar post na galeria (Requer token)
- `GET /api/galeria` - Listar todos os posts
- `GET /api/galeria/evento/{eventoId}` - Listar posts de um evento
- `GET /api/galeria/meus-posts` - Listar posts do usuário (Requer token)
- `GET /api/galeria/{id}` - Buscar post por ID
- `PUT /api/galeria/{id}` - Atualizar post (Requer token)
- `DELETE /api/galeria/{id}` - Deletar post (Requer token)

## 📚 Documentação da API

### Autenticação

Todos os endpoints protegidos requerem um header `Authorization` com o JWT token:

```bash
Authorization: Bearer <seu_jwt_token>
```

### Exemplo de Request

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "senha": "senha123"
  }'
```

### Exemplo de Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "tipo": "Convidado",
    "ativo": true,
    "criadoEm": "2025-04-09T10:00:00Z"
  }
}
```

## 🏗️ Arquitetura Limpa

O projeto segue os princípios de **Clean Architecture** e **Domain-Driven Design**:

- **Controllers**: Camada de apresentação, recebem requisições HTTP
- **Services**: Lógica de negócio isolada e testável
- **Repositories**: Abstração da camada de dados com padrão Repository
- **Models**: Entidades de domínio
- **DTOs**: Objetos de transferência de dados para requisições/respostas
- **Exceptions**: Exceções customizadas para tratamento de erros

## 🔐 Segurança

- ✅ Passwords hasheadas com BCrypt
- ✅ JWT tokens com expiração configurável
- ✅ Validação de entrada com FluentValidation
- ✅ CORS configurado
- ✅ Autorização por roles (Admin/Convidado)

## 📝 Migrations do Banco de Dados

```bash
# Criar nova migration
dotnet ef migrations add NomeDaMigration

# Aplicar migrations
dotnet ef database update

# Reverter última migration
dotnet ef database update -1
```

## 🐛 Debugging

### Visual Studio Code

1. Instalar a extensão **C#** da Microsoft
2. Pressionar `F5` para iniciar o debugger
3. Definir breakpoints clicando na margem esquerda

### Visual Studio Community

1. Abrir a solução em Visual Studio
2. Pressionar `F5` para iniciar com debugger

## 📦 Build e Deploy

### Build para Production

```bash
dotnet publish -c Release -o ./publish
```

### Docker Build

```bash
docker build -t revelacao-cha:latest .
```

## 🤝 Contribuindo

Ao contribuir para este projeto:

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto é parte da aplicação Memuvie e segue a mesma licença do projeto principal.

## 👥 Autores

Desenvolvido pela equipe **Memuvie**.

## 📞 Suporte

Para suporte, abra uma issue no repositório do GitHub ou entre em contato com a equipe de desenvolvimento.

---

**Última atualização**: Abril de 2025
